import ts from 'typescript';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
class PresentationVisitor {
    readonly errors: string[] = [];
    private readonly elementFactories=new Set<string>();
    collect(source:ts.SourceFile):void{for(const node of source.statements)if(ts.isImportDeclaration(node)&&ts.isStringLiteral(node.moduleSpecifier)&&node.moduleSpecifier.text==='react'){const bindings=node.importClause?.namedBindings;if(bindings&&ts.isNamedImports(bindings))for(const item of bindings.elements)if((item.propertyName??item.name).text==='createElement')this.elementFactories.add(item.name.text);}}
    constructor(private readonly file: string) { }
    private fail(): void { this.errors.push(this.file + ': visual rendering and styles must come from UI providers'); }
    visit(node: ts.Node): void {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
            const tag = node.tagName.getText();
            if (/^[a-z]/.test(tag))
                this.fail();
        }
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
            const path = node.moduleSpecifier.text;
            if (/\.(?:css|scss|sass|less|astro)(?:$|\?)/.test(path) || /^(?:react-dom(?:\/|$)|@astrojs\/)/.test(path))
                this.fail();
        }
        if (ts.isCallExpression(node)) {
            const callee = node.expression;
            if (ts.isPropertyAccessExpression(callee) && ['createElement', 'createElementNS', 'insertAdjacentHTML', 'write', 'writeln', 'appendChild', 'replaceChildren'].includes(callee.name.text)) {
                if (callee.name.text !== 'createElement' || !node.arguments[0] || ts.isStringLiteral(node.arguments[0]))
                    this.fail();
            }
            if (ts.isIdentifier(callee) && (callee.text === 'createElement'||this.elementFactories.has(callee.text)) && node.arguments[0] && ts.isStringLiteral(node.arguments[0]))
                this.fail();
        }
        if (ts.isPropertyAccessExpression(node) && ['innerHTML', 'outerHTML', 'textContent', 'innerText', 'dangerouslySetInnerHTML', 'cssText', 'style', 'className', 'classList'].includes(node.name.text))
            this.fail();
        if (ts.isJsxAttribute(node) && ['style', 'dangerouslySetInnerHTML'].includes(node.name.getText()))
            this.fail();
        if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) && /<\/?[a-z][a-z0-9:-]*(?:\s|>|\/)/i.test(node.text))
            this.fail();
        ts.forEachChild(node, this.visit.bind(this));
    }
}
export class UiSourcePolicy {
    inspect(file: string, source: string): string[] { if (file.endsWith('.astro') || /\.(?:css|scss|sass|less)$/.test(file))
        return [file + ': visual rendering and styles must come from UI providers']; const visitor = new PresentationVisitor(file); const parsed=ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);visitor.collect(parsed);visitor.visit(parsed); return visitor.errors; }
    check(root = process.cwd()): void { const files = this.files(join(resolve(root), 'src')), errors: string[] = []; for (const file of files)
        errors.push(...this.inspect(relative(root, file), readFileSync(file, 'utf8'))); if (errors.length)
        throw new Error(errors.join('\n')); }
    private files(directory: string): string[] { const result: string[] = []; for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const file = join(directory, entry.name);
        if (entry.isSymbolicLink())
            throw new Error('UI_SOURCE_SYMLINK');
        if (entry.isDirectory())
            result.push(...this.files(file));
        else if (/\.(?:tsx?|astro|css|scss|sass|less)$/.test(entry.name))
            result.push(file);
    } return result; }
}
