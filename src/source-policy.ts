import ts from 'typescript';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
class PresentationVisitor {
    readonly errors: string[] = [];
    private readonly elementFactories=new Set<string>();
    private readonly documents=new Set<string>(['document']);private readonly writers=new Set<string>();
    private member(value:ts.Expression):{receiver:ts.Expression;name:string}|null{if(ts.isPropertyAccessExpression(value))return {receiver:value.expression,name:value.name.text};if(ts.isElementAccessExpression(value)&&value.argumentExpression&&ts.isStringLiteral(value.argumentExpression))return {receiver:value.expression,name:value.argumentExpression.text};return null;}
    private document(value:ts.Expression):boolean{if(ts.isParenthesizedExpression(value)||ts.isAsExpression(value)||ts.isNonNullExpression(value))return this.document(value.expression);if(ts.isIdentifier(value))return this.documents.has(value.text);const property=this.member(value);return Boolean(property&&['document','ownerDocument','contentDocument'].includes(property.name));}
    private collectAliases(node:ts.Node):void{if(ts.isVariableDeclaration(node)&&node.initializer){if(ts.isIdentifier(node.name)){if(this.document(node.initializer))this.documents.add(node.name.text);const method=this.member(node.initializer);if(method&&['write','writeln'].includes(method.name)&&this.document(method.receiver))this.writers.add(node.name.text);}else if(ts.isObjectBindingPattern(node.name)&&this.document(node.initializer))for(const binding of node.name.elements){const name=binding.propertyName??binding.name;if(ts.isIdentifier(name)&&['write','writeln'].includes(name.text)&&ts.isIdentifier(binding.name))this.writers.add(binding.name.text);}}ts.forEachChild(node,this.collectAliases.bind(this));}

    collect(source:ts.SourceFile):void{for(const node of source.statements)if(ts.isImportDeclaration(node)&&ts.isStringLiteral(node.moduleSpecifier)&&node.moduleSpecifier.text==='react'){const bindings=node.importClause?.namedBindings;if(bindings&&ts.isNamedImports(bindings))for(const item of bindings.elements)if((item.propertyName??item.name).text==='createElement')this.elementFactories.add(item.name.text);}this.collectAliases(source);}
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
            const callee = node.expression,member=this.member(callee);
            if((member&&['write','writeln'].includes(member.name)&&this.document(member.receiver))||(ts.isIdentifier(callee)&&this.writers.has(callee.text)))this.fail();
            if (ts.isPropertyAccessExpression(callee) && ['createElement', 'createElementNS', 'insertAdjacentHTML', 'appendChild', 'replaceChildren'].includes(callee.name.text)) {
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
