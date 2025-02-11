// src/providers/completionProvider.ts
import * as vscode from 'vscode';
import { GrokProvider } from '../grokProvider';

export function registerCompletionProvider(grokProvider: GrokProvider) {
    return vscode.languages.registerCompletionItemProvider(
        { pattern: '**' },
        {
            async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const linePrefix = document.lineAt(position).text.substr(0, position.character);
                
                if (linePrefix.trim().length < 3) {
                    return undefined;
                }

                try {
                    const completionText = await grokProvider.complete(linePrefix);
                    const completionItem = new vscode.CompletionItem(completionText);
                    completionItem.insertText = completionText;
                    completionItem.detail = 'Grok suggestion';
                    
                    return [completionItem];
                } catch (error) {
                    console.error('Completion error:', error);
                    return undefined;
                }
            }
        },
        '.',
        '(',
        '{',
        '[',
        ','
    );
}
