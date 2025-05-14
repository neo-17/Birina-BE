import Product from '../models/gamosaProduct.model';
import User from '../models/user.model';
import { Hex } from 'viem';
import { baseSepolia } from 'viem/chains';
import ProductNFT from '../../abi/Gamosa.json';
import { generateTokenId, publicClient, walletClient } from '../libs/biconomy';
import transactionModel from '../models/transaction.model';
import { uploadNftImageToIpfs } from '../services/uploadNftImageToIpfs';
import { pinata } from '../libs/pinata';

const convertBigIntToString = (value: any): any => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }
  
  if (Array.isArray(value)) {
    return value.map(item => convertBigIntToString(item));
  }
  
  if (typeof value === 'object') {
    const converted: any = {};
    for (const [key, val] of Object.entries(value)) {
      converted[key] = convertBigIntToString(val);
    }
    return converted;
  }
  
  return value;
};

export const mintNFTForUser = async (req: any, res: any) => {
  try {
    const { productId, walletAddress, qrCode, network } = req.body;

    // 1. Find the product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 2. Check the QR code is valid
    const qrObj = product.qrCodes.find((qr) => qr.code === qrCode);
    if (!qrObj) {
      return res.status(400).json({ message: 'Invalid code' });
    }
    if (qrObj.claimed) {
      return res.status(400).json({ message: 'Already claimed / minted for this code' });
    }

    // generate a unique nft token id
    const tokenId = generateTokenId() as number;

    // before minting save the metadata of nft to IPFS
    // Update Transaction Model with data
    const user = await User.findOne({ smartAccountAddress: walletAddress });

    const imageUrl = 'https://ipfs.io/ipfs/bafybeigz5oqxeqgqqxoja6xfylxtjxq3ujeyy25bn55tflnkghv4fgbysa';
    
    await qrObj.save();

    const metadata = {
      type: product.gamosaType,
      description: `This product is a digital collectible representing cultural artifacts of Northeast India, having BRN as symbol, created at ${product.district} district, ${product.subdivision} subdivision, ${product.village} cluster on ${product.wentIntoTheLoom}.`,
      image: 'https://ipfs.io/ipfs/bafybeigz5oqxeqgqqxoja6xfylxtjxq3ujeyy25bn55tflnkghv4fgbysa',
      attributes: [
        // Optional: Attributes can be an array if you have multiple key-value pairs
        {
          trait_type: 'Token ID',
          value: tokenId,
        },
        {
          trait_type: 'Receiver Address',
          value: walletAddress,
        },
        {
          trait_type: 'Type',
          value: product.gamosaType as Hex,
        },
        {
          trait_type: 'District',
          value: product.district,
        },
        {
          trait_type: 'Subdivision',
          value: product.subdivision,
        },
        {
          trait_type: 'Village',
          value: product.village,
        },
        {
          trait_type: 'Weaver Name',
          value: product.weaverName,
        },
        {
          trait_type: 'Went Into The Loom',
          value: product.wentIntoTheLoom,
        },
        {
          trait_type: 'NFT URL',
          value: imageUrl
        }
      ],
    };

    const metadataHash = await pinata.upload.json(metadata);

    const metadataUrl = `https://ipfs.io/ipfs/${metadataHash.IpfsHash}`;

    const txHash = await walletClient.writeContract({
      address: process.env.CONTRACT_ADDRESS as Hex,
      abi: ProductNFT.abi as any,
      chain: baseSepolia,
      functionName: 'mintWithQRCode',
      args: [walletAddress, qrCode, metadataUrl],
    });

    // Convert and log transaction hash
    const stringTxHash = convertBigIntToString(txHash);

    // 4. Wait for transaction confirmation and convert the receipt
    const rawReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    
    if (!rawReceipt.status) {
      return res.status(500).json({ message: 'Transaction failed' });
    }

    // 5. Query the contract and convert the result
    // const rawToken = await publicClient.readContract({
    //   address: product.contractAddress as Hex,
    //   abi: ProductNFT.abi as any,
    //   functionName: 'balanceOf',
    //   args: [walletAddress]
    // });

    // const token = convertBigIntToString(rawToken);
    // 6. Mark the QR as claimed
    qrObj.claimed = true;
    qrObj.claimedBy = walletAddress;
    qrObj.mintedTokenId = tokenId ? tokenId.toString() : `${tokenId}`;
    await product.save();

    // 7. Update user's record
    const userDoc = await User.findOne({ smartAccountAddress: walletAddress });
    if (userDoc) {
      userDoc.claims.push({
        gamosa: product._id,
        tokenId: parseInt(tokenId ? tokenId.toString() : `${tokenId}`),
        claimedAt: new Date(),
        claimedNFTUrl: imageUrl
      });
      await userDoc.save();
    }

    // Prepare response object and convert all potential BigInts
    const responseObj = {
      message: 'NFT minted successfully',
      txHash: stringTxHash,
      tokenId: tokenId ? tokenId.toString() : `${tokenId}`,
      receipt: rawReceipt // Including converted receipt for debugging
    };

    // Final conversion of the entire response object
    const safeResponse = convertBigIntToString(responseObj);

    return res.status(200).json(safeResponse);
  } catch (error) {
    console.error('Error in mintNFTForUser:', error);
    // Log the full error object for debugging
    console.error('Full error:', JSON.stringify(error, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value
    ));
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const batchRegisterQRCodes = async (req: any, res: any) => {
  try {
    // 1. Fetch all products with QR codes from the database
    const products = await Product.find({ 'qrCodes.0': { $exists: true } });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products with QR codes found' });
    }

    // 2. Extract QR codes and gamosa IDs
    const qrCodesAll: string[] = [];
    const gamosaIdsAll: string[] = [];

    products.forEach(product => {
      product.qrCodes.forEach(qrObj => {
        if (qrObj.code && !qrObj.claimed) {
          qrCodesAll.push(qrObj.code);
          gamosaIdsAll.push(product._id.toString());
        }
      });
    });

    if (qrCodesAll.length === 0) {
      return res.status(200).json({ message: 'No unregistered QR codes found' });
    }

    // 3. Split into smaller batches (max 50 per batch to avoid gas limits)
    const BATCH_SIZE = 50;
    const batches = [];

    for (let i = 0; i < qrCodesAll.length; i += BATCH_SIZE) {
      batches.push({
        qrCodes: qrCodesAll.slice(i, i + BATCH_SIZE),
        gamosaIds: gamosaIdsAll.slice(i, i + BATCH_SIZE)
      });
    }

    // 4. Process each batch
    const results = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} with ${batch.qrCodes.length} items`);

      try {
        // Call the smart contract
        const txHash = await walletClient.writeContract({
          address: process.env.CONTRACT_ADDRESS as Hex,
          abi: ProductNFT.abi as any,
          chain: baseSepolia,
          functionName: 'batchRegisterQRCodes',
          args: [batch.qrCodes, batch.gamosaIds],
        });

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        if (receipt.status === 'success') {
          console.log(`Batch ${batchIndex + 1} registered successfully, tx: ${receipt.transactionHash}`);
          results.push({
            batchIndex,
            status: 'success',
            txHash: receipt.transactionHash,
            itemsProcessed: batch.qrCodes.length
          });
        } else {
          console.error(`Batch ${batchIndex + 1} failed, tx: ${receipt.transactionHash}`);
          results.push({
            batchIndex,
            status: 'failed',
            txHash: receipt.transactionHash,
            itemsProcessed: 0
          });
        }
      } catch (error) {
        console.error(`Error processing batch ${batchIndex + 1}:`, error);
        results.push({
          batchIndex,
          status: 'error',
          error: error || 'Unknown error',
          itemsProcessed: 0
        });
      }

      // Add a small delay between batches to allow the network to process
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // 5. Return summary of results
    const successfulBatches = results.filter(r => r.status === 'success').length;
    const totalItemsProcessed = results.reduce((sum, r) => sum + r.itemsProcessed, 0);

    return res.status(200).json({
      message: `Processed ${successfulBatches}/${batches.length} batches successfully`,
      totalQRCodes: qrCodesAll.length,
      totalRegistered: totalItemsProcessed,
      batchResults: results
    });

  } catch (error) {
    console.error('Error in batchRegisterQRCodes:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error || 'Unknown error'
    });
  }
};

  
  /**
   * Check the registration status of QR codes in the contract
   * This function allows you to verify which QR codes have been registered
   */
  export const checkQRCodeRegistrationStatus = async (req: any, res: any) => {
    try {
      // Fetch all products with QR codes
      const products = await Product.find({ 'qrCodes.0': { $exists: true } });
      
      if (!products || products.length === 0) {
        return res.status(404).json({ message: 'No products with QR codes found' });
      }
      
      // Extract QR codes to check
      const qrCodesToCheck: string[] = [];
      const productMap = new Map();
      
      products.forEach(product => {
        product.qrCodes.forEach(qrObj => {
          if (qrObj.code) {
            qrCodesToCheck.push(qrObj.code);
            productMap.set(qrObj.code, {
              productId: product._id.toString(),
              claimed: qrObj.claimed,
              claimedBy: qrObj.claimedBy
            });
          }
        });
      });
      
      // Check status for each QR code (limit to first 50 to avoid request size issues)
      const checkLimit = 50;
      const qrCodesToProcess = qrCodesToCheck.slice(0, checkLimit);
      const results = [];
      
      for (const qrCode of qrCodesToProcess) {
        try {
          // Call the contract to check if this QR code is registered
          const gamosaId = await publicClient.readContract({
            address: process.env.CONTRACT_ADDRESS as Hex,
            abi: ProductNFT.abi as any,
            functionName: 'qrCodeToGamosaId',
            args: [qrCode]
          });
          
          const productInfo = productMap.get(qrCode);
          
          results.push({
            qrCode,
            registeredInContract: gamosaId && gamosaId !== '',
            gamosaIdInContract: gamosaId || null,
            productIdInDB: productInfo.productId,
            claimedInDB: productInfo.claimed,
            claimedBy: productInfo.claimedBy
          });
        } catch (error) {
          console.error(`Error checking QR code ${qrCode}:`, error);
          results.push({
            qrCode,
            error: error || 'Unknown error'
          });
        }
      }
      
      return res.status(200).json({
        message: `Checked ${results.length}/${qrCodesToCheck.length} QR codes`,
        note: qrCodesToCheck.length > checkLimit ? 'Limited to first 50 QR codes' : null,
        totalQRCodes: qrCodesToCheck.length,
        results
      });
      
    } catch (error) {
      console.error('Error in checkQRCodeRegistrationStatus:', error);
      return res.status(500).json({ 
        message: 'Internal server error', 
        error: error || 'Unknown error' 
      });
    }
  };

