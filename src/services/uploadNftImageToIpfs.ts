import Jimp from 'jimp';
import path from 'path';
import { File } from 'buffer'
import { pinata } from "../libs/pinata";
import { Blob } from 'buffer';

interface TextPosition {
    x: number;
    y: number;
}

interface TemplateConfig {
    fileName: string;
    username: TextPosition;
    tokenId: TextPosition;
}

// Define configurations for each template
const TEMPLATE_CONFIGS: Record<string, TemplateConfig[]> = {
    'gamosa': [
        {
            fileName: 'BIRINA_NFT.jpeg',
            username: { 
                x: 750,  // Center horizontally (1500 / 2)
                y: 1440  // Near the bottom (20px padding from the bottom of the 1500px image)
            },
            tokenId: { 
                x: 750,  // Center horizontally (1500 / 2)
                y: 1400  // Just above the username with 40px space
            },
        }
    ]
};

function getRandomTemplate(productType: string): TemplateConfig {
    const templates = TEMPLATE_CONFIGS['gamosa'];
    if (!templates) {
        throw new Error(`No templates found for product type: ${productType}`);
    }
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
}

async function uploadNftImageToIpfs(username: string, type: string, tokenId: number): Promise<string> {
    try {
        // Get random template configuration based on product type
        const template = getRandomTemplate('gamosa');
        console.log('template', template);
        const templatePath = path.join(process.cwd(), 'public', template.fileName);
        console.log('templatePath', templatePath);
        // Load the template image
        const image = await Jimp.read(templatePath);
        console.log('image', image);
        // Load fonts
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

        // Add username
        image.print(
            font,
            template.username.x,
            template.username.y,
            username
        );

        // Add token ID
        image.print(
            font,
            template.tokenId.x,
            template.tokenId.y,
            `#${tokenId}`
        );

        // Convert image to buffer
        const imageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
        console.log('imageBuffer', imageBuffer);

        const blob = new Blob([imageBuffer], { type: 'image/png' })
        console.log('blob', blob);
        const file = new File([blob], 'gamosa-birina', { type: 'image/png' })
        console.log('file', file);
        const result = await pinata.upload.file(file)
        console.log('result', result);
        console.log(`Url: https:ipfs.io/ipfs/${result.IpfsHash}`);
        return `https:ipfs.io/ipfs/${result.IpfsHash}`;

    } catch (error) {
        console.error('Error generating and uploading NFT image:', error);
        throw new Error('Failed to generate and upload NFT image');
    }
}

export { uploadNftImageToIpfs };