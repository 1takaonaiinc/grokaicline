// src/extension.ts
import * as vscode from 'vscode';
import { OpenAI } from 'openai';
import { GrokProvider } from './grokProvider';
import { registerCompletionProvider } from './providers/completionProvider';

let grokProvider: GrokProvider;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Grok Assistant');
    
    const config = vscode.workspace.getConfiguration('grok-assistant');
    const apiKey = config.get<string>('apiKey');

    if (!apiKey) {
        vscode.window.showErrorMessage('Please set your Grok API key in settings.');
        return;
    }

    grokProvider = new GrokProvider(apiKey);

    // Register completion provider
    if (config.get<boolean>('inlineCompletion')) {
        context.subscriptions.push(
            registerCompletionProvider(grokProvider)
        );
    }

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('grok-assistant.explainCode', explainCode),
        vscode.commands.registerCommand('grok-assistant.completeCode', completeCode),
        vscode.commands.registerCommand('grok-assistant.generateTests', generateTests),
        vscode.commands.registerCommand('grok-assistant.fixCode', fixCode),
        vscode.commands.registerCommand('grok-assistant.askQuestion', askQuestion)
    );

    // Watch for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('grok-assistant')) {
                const newConfig = vscode.workspace.getConfiguration('grok-assistant');
                const newApiKey = newConfig.get<string>('apiKey');
                if (newApiKey) {
                    grokProvider = new GrokProvider(newApiKey);
                }
            }
        })
    );
}

async function explainCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (!text) {
        vscode.window.showErrorMessage('No code selected');
        return;
    }

    try {
        const response = await grokProvider.explain(text);
        showResponse('Code Explanation', response);
    } catch (error) {
        handleError(error);
    }
}

async function completeCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }

    const position = editor.selection.active;
    const linePrefix = editor.document.lineAt(position.line).text.substr(0, position.character);

    try {
        const response = await grokProvider.complete(linePrefix);
        editor.edit(editBuilder => {
            editBuilder.insert(position, response);
        });
    } catch (error) {
        handleError(error);
    }
}

async function generateTests() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (!text) {
        vscode.window.showErrorMessage('No code selected');
        return;
    }

    try {
        const response = await grokProvider.generateTests(text);
        showResponse('Generated Tests', response);
    } catch (error) {
        handleError(error);
    }
}

async function fixCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (!text) {
        vscode.window.showErrorMessage('No code selected');
        return;
    }

    const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
    const errors = diagnostics
        .filter(d => d.severity === vscode.DiagnosticSeverity.Error)
        .map(d => d.message)
        .join('\n');

    try {
        const response = await grokProvider.fix(text, errors);
        showResponse('Fixed Code', response);
    } catch (error) {
        handleError(error);
    }
}

async function askQuestion() {
    const question = await vscode.window.showInputBox({
        prompt: 'What would you like to ask Grok?',
        placeHolder: 'Enter your question...'
    });

    if (!question) {
        return;
    }

    try {
        const response = await grokProvider.ask(question);
        showResponse('Grok Response', response);
    } catch (error) {
        handleError(error);
    }
}

function showResponse(title: string, content: string) {
    outputChannel.clear();
    outputChannel.appendLine(`${title}:\n`);
    outputChannel.appendLine(content);
    outputChannel.show();
}

function handleError(error: any) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    vscode.window.showErrorMessage(`Grok Assistant Error: ${message}`);
}

export function deactivate() {}
