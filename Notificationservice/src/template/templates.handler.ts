import fs from 'fs/promises'
import path from 'path'
import Handlebars from 'handlebars'
import { InternalServerError } from '../utils/errors/app.error';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

export async function rendermailTemplate(templateId: string, params: Record<string, any>): Promise<string> {
    // When typescript compiles, it places the output in the 'dist' folder.
    // __dirname will point to 'dist/template', but our .hbs files are in 'src/template/mailer'.
    // We need to adjust the path to point to the correct location in the source directory.
    const templateFolder = path.resolve(__dirname, '../../src/template/mailer');
    
    const templatePath = path.join(templateFolder, `${templateId}.hbs`);
    
    try {
        const content = await fs.readFile(templatePath, 'utf-8');
        const finalTemplate = Handlebars.compile(content);
        return finalTemplate(params);
    } catch (error) {
        throw new InternalServerError(`Template not found : ${templateId} at path ${templatePath}`);
    }
}