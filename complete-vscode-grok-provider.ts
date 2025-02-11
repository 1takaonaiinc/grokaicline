// src/grokProvider.ts
import { OpenAI } from 'openai';

export class GrokProvider {
    private client: OpenAI;
    
    constructor(apiKey: string) {
        this.client = new OpenAI({
            apiKey: apiKey,
            baseURL: 'https://api.x.ai/v1'
        });
    }

    async complete(code: string): Promise<string> {
        const completion = await this.client.chat.completions.create({
            model: 'grok-2-latest',
            messages: [
                {
                    role: 'system',
                    content: 'You are a code completion assistant. Complete the code snippet provided.'
                },
                {
                    role: 'user',
                    content: `Complete this code:\n${code}`
                }
            ],
            temperature: 0.2,
        });

        return completion.choices[0].message.content || '';
    }

    async explain(code: string): Promise<string> {
        const completion = await this.client.chat.completions.create({
            model: 'grok-2-latest',
            messages: [
                {
                    role: 'system',
                    content: 'You are a code explanation assistant. Explain the code snippet provided.'
                },
                {
                    role: 'user',
                    content: `Explain this code:\n${code}`
                }
            ]
        });

        return completion.choices[0].message.content || '';
    }

    async generateTests(code: string): Promise<string> {
        const completion = await this.client.chat.completions.create({
            model: 'grok-2-latest',
            messages: [
                {
                    role: 'system',
                    content: 'You are a test generation assistant. Generate unit tests for the code provided.'
                },
                {
                    role: 'user',
                    content: `Generate tests for this code:\n${code}`
                }
            ]
        });

        return completion.choices[0].message.content || '';
    }

    async fix(code: string, errors: string): Promise<string> {
        const completion = await this.client.chat.completions.create({
            model: 'grok-2-latest',
            messages: [
                {
                    role: 'system',
                    content: 'You are a code fixing assistant. Fix the code based on the errors provided.'
                },
                {
                    role: 'user',
                    content: `Fix this code with errors:\nErrors:\n${errors}\n\nCode:\n${code}`
                }
            ]
        });

        return completion.choices[0].message.content || '';
    }

    async ask(question: string): Promise<string> {
        const completion = await this.client.chat.completions.create({
            model: 'grok-2-latest',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful programming assistant.'
                },
                {
                    role: 'user',
                    content: question
                }
            ]
        });

        return completion.choices[0].message.content || '';
    }
}
