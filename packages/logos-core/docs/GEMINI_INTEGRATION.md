# Gemini Integration Guide

Este guia explica como usar o Gemini 3 Pro (ou modelos mais recentes) com o LOGOS.

## Pré-requisitos

1. **Obter uma API Key do Google AI**
   - Acesse: https://makersuite.google.com/app/apikey
   - Crie uma nova API key
   - Guarde-a em segurança

2. **Configurar variável de ambiente**
   ```bash
   export GEMINI_API_KEY="sua-api-key-aqui"
   ```

   No Windows PowerShell:
   ```powershell
   $env:GEMINI_API_KEY="sua-api-key-aqui"
   ```

## Modelos Disponíveis

O Google oferece vários modelos através da API:

- **`gemini-1.5-pro`** - Modelo mais avançado, melhor para tarefas complexas
- **`gemini-1.5-flash`** - Modelo mais rápido, bom para tarefas simples
- **`gemini-2.0-flash-exp`** - Versão experimental mais recente

> **Nota**: O Gemini 3 Pro pode não estar disponível diretamente via API ainda. Use `gemini-1.5-pro` ou `gemini-2.0-flash-exp` para obter os melhores resultados.

## Uso Básico

### 1. Importar e Configurar

```typescript
import { GeminiIntegration } from '@logos/core';
import type { Source } from '@logos/core';

const gemini = new GeminiIntegration(
  {
    apiKey: process.env.GEMINI_API_KEY!,
    modelName: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 0.2, // ✅ Lower for deterministic verification (default: 0.2)
      maxOutputTokens: 2048,
    },
    maxRequestsPerMinute: 60, // ✅ Rate limiting (default: 60)
  },
  {
    // Configuração do LOGOS engine
    policy: {
      allowThreshold: 0.7,
      blockThreshold: 0.3,
      redemptiveMode: true,
      maxResurrectionAttempts: 3,
    },
  }
);
```

### 2. Gerar e Verificar em Uma Chamada

```typescript
const source: Source = {
  intent: 'What is the capital of France?',
  groundTruth: { capital: 'Paris', country: 'France' },
  timestamp: new Date(),
};

// Gera a manifestação e verifica automaticamente
const result = await gemini.generateAndVerify(source);

console.log('Manifestation:', result.manifestation.content);
console.log('Decision:', result.verification.decision);
console.log('Confidence:', result.verification.confidence);
```

### 3. Uso Passo a Passo

```typescript
// Passo 1: Gerar manifestação
const source: Source = {
  intent: 'Explain quantum entanglement',
  timestamp: new Date(),
};

const manifestation = await gemini.generateManifestation(source);

// Passo 2: Verificar separadamente
const verification = await gemini.verifyManifestation(source, manifestation);

console.log('Decision:', verification.decision);
console.log('Gap Distance:', verification.gap.distance.overall);
```

## Exemplo Completo

Execute o exemplo incluído:

```bash
# Configure a API key primeiro
export GEMINI_API_KEY="sua-api-key"

# Execute o exemplo
cd packages/logos-core
pnpm exec tsx examples/gemini-usage.ts
```

## Arquitetura Christológica

O fluxo de integração segue a arquitetura LOGOS:

```
FATHER (Source/Intent)
    ↓
GEMINI (Gera Manifestation)
    ↓
SON (Manifestation/Output)
    ↓
LOGOS (Verifica o Gap)
    ↓
SPIRIT (Verifier/Signals)
    ↓
CHRISTOLOGICAL RESULT
```

1. **Source (Pai)**: A intenção original, o prompt
2. **Gemini**: Gera a manifestação (o "Filho")
3. **LOGOS Engine**: Verifica o gap entre intenção e manifestação
4. **Result**: Decisão final (ALLOW, BLOCK, STEP_UP)

## Configuração Avançada

### Melhorias de Segurança e Robustez

A integração inclui várias melhorias automáticas:

✅ **Validação de API Key**: Verifica se a API key é válida antes de usar
✅ **Rate Limiting**: Previne exceder limites da API (padrão: 60 req/min)
✅ **Validação de Signals**: Valores clamped para range [-1, 1]
✅ **Parsing JSON Robusto**: Remove markdown code fences automaticamente
✅ **Tratamento de Erros**: Fallback seguro quando Gemini falha
✅ **Temperature Otimizada**: Padrão 0.2 para verificação determinística

### Ajustar Parâmetros de Geração

```typescript
gemini.updateModelConfig({
  generationConfig: {
    temperature: 0.1, // Mais determinístico (0.1-0.3 recomendado para verificação)
    topP: 0.9,
    topK: 20,
    maxOutputTokens: 4096,
  },
});
```

### Usar Sinais Customizados

```typescript
import type { Signal } from '@logos/core';

const customSignals: Signal[] = [
  { name: 'grounding_factual', value: 0.9, weight: 1.0, source: 'kb' },
  { name: 'semantic_coherence', value: 0.8, weight: 0.8, source: 'embedding' },
];

const result = await gemini.verifyManifestation(source, manifestation, customSignals);
```

## Troubleshooting

### Erro: "API key not found"
- Certifique-se de que a variável `GEMINI_API_KEY` está configurada
- Verifique se a API key é válida

### Erro: "Model not found"
- Verifique se o nome do modelo está correto
- Use `gemini-1.5-pro` como padrão seguro

### Baixa Confiança nas Verificações
- Ajuste os thresholds no LOGOS config
- Forneça `groundTruth` mais detalhado no Source
- Use sinais customizados para melhor controle

## Próximos Passos

- Integrar com outros modelos (OpenAI, Anthropic)
- Usar Gemini para geração de sinais de verificação
- Implementar ressurreição usando Gemini para correção

