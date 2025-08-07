const logger = require('../utils/logger');
const fetch = require('node-fetch');

// Configuration constants
const DEFAULT_CONFIG = {
  API_URL: 'https://api.deepseek.com/v1/chat/completions',
  MODEL: 'deepseek-chat',
  TEMPERATURE: 0.5,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 15000
};

class AIService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.config = {
      url: process.env.DEEPSEEK_URL || DEFAULT_CONFIG.API_URL,
      model: process.env.DEEPSEEK_MODEL || DEFAULT_CONFIG.MODEL,
      temperature: parseFloat(process.env.DEEPSEEK_TEMP) || DEFAULT_CONFIG.TEMPERATURE,
      maxRetries: process.env.DEEPSEEK_MAX_RETRIES || DEFAULT_CONFIG.MAX_RETRIES,
      retryDelay: process.env.DEEPSEEK_RETRY_DELAY || DEFAULT_CONFIG.RETRY_DELAY,
      timeout: process.env.DEEPSEEK_TIMEOUT || DEFAULT_CONFIG.TIMEOUT
    };
  }

  /**
   * Analyze a GitHub repository and generate architecture insights
   * @param {Object} repoInfo - Repository information
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeRepository(repoInfo) {
    try {
      this.validateApiKey();
      this.validateRepoInfo(repoInfo);

      const prompt = this.buildAnalysisPrompt(repoInfo);
      const analysis = await this.fetchWithRetry(prompt);

      return this.formatAnalysisResults(analysis);
    } catch (error) {
      logger.error('AI Analysis failed:', error);
      return this.generateFallbackResponse(error);
    }
  }

  /**
   * Validate the API key is configured
   * @throws {Error} If API key is missing
   */
  validateApiKey() {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }
  }

  /**
   * Validate repository information
   * @param {Object} repoInfo - Repository information
   * @throws {Error} If repoInfo is invalid
   */
  validateRepoInfo(repoInfo) {
    if (!repoInfo || typeof repoInfo !== 'object') {
      throw new Error('Invalid repository information');
    }
  }

  /**
   * Build the AI prompt for repository analysis
   * @param {Object} repoInfo - Repository information
   * @returns {string} Formatted prompt
   */
  buildAnalysisPrompt(repoInfo) {
    return `Tu es un architecte logiciel expert.

Analyse le dépôt GitHub suivant et génère :
1. Un résumé technique concis
2. Un diagramme d'architecture HTML/CSS détaillé

--- INFORMATIONS DU DÉPÔT ---
${this.formatRepoMetadata(repoInfo)}

--- EXIGENCES ---
${this.getArchitectureRequirements()}

--- FORMAT REQUIS ---
${this.getResponseFormat()}`;
  }

  /**
   * Format repository metadata for the prompt
   * @param {Object} repoInfo - Repository information
   * @returns {string} Formatted metadata
   */
  formatRepoMetadata(repoInfo) {
    return `Nom: ${repoInfo.name || 'Non spécifié'}
Description: ${repoInfo.description || 'Aucune description'}
Langage principal: ${repoInfo.language || 'Inconnu'}
URL: ${repoInfo.html_url || 'Non disponible'}`;
  }

  /**
   * Get architecture analysis requirements
   * @returns {string} Formatted requirements
   */
  getArchitectureRequirements() {
    return `## 🔍 Analyse structurelle
- Détecte les composants principaux (controllers, services, etc.)
- Identifie les flux de données entre modules
- Analyse les dépendances critiques

## 🎨 Diagramme visuel
- Structure en 3-5 couches logiques
- Conteneurs stylisés avec bordures arrondies
- Flèches directionnelles CSS
- Icônes SVG pour les types de fichiers
- Palette de couleurs cohérente

## 📝 Résumé technique
- 5-7 points clés maximum
- Technologies principales
- Architecture globale
- Points d'entrée`;
  }

  /**
   * Get required response format
   * @returns {string} Formatted response format
   */
  getResponseFormat() {
    return `\`\`\`html
<div class="architecture-diagram">
  <!-- Diagramme HTML/CSS ici -->
</div>
\`\`\`

\`\`\`text
// Résumé technique ici
\`\`\``;
  }

  /**
   * Fetch AI response with retry mechanism
   * @param {string} prompt - Analysis prompt
   * @param {number} attempt - Current attempt number
   * @returns {Promise<Object>} AI response
   */
  async fetchWithRetry(prompt, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: this.config.temperature
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data);

    } catch (error) {
      if (attempt >= this.config.maxRetries) throw error;
      await new Promise(res => setTimeout(res, this.config.retryDelay * attempt));
      return this.fetchWithRetry(prompt, attempt + 1);
    }
  }

  /**
   * Parse AI response data
   * @param {Object} data - Raw AI response
   * @returns {Object} Parsed response
   */
  parseAIResponse(data) {
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid AI response format');
    }

    const content = data.choices[0].message.content;
    return {
      rawContent: content,
      diagram: this.extractHtmlContent(content),
      summary: this.extractTextSummary(content)
    };
  }

  /**
   * Format analysis results
   * @param {Object} analysis - Raw analysis data
   * @returns {Object} Formatted results
   */
  formatAnalysisResults(analysis) {
    return {
      summary: analysis.summary,
      htmlSchema: this.wrapDiagram(analysis.diagram),
      recommendations: this.extractRecommendations(analysis.rawContent),
      diagramSource: true,
      rawAnalysis: analysis.rawContent
    };
  }

  /**
   * Extract HTML content from AI response
   * @param {string} content - AI response content
   * @returns {string|null} Extracted HTML
   */
  extractHtmlContent(content) {
    const htmlRegex = /```html([\s\S]*?)```/;
    const htmlMatch = content.match(htmlRegex);
    
    if (!htmlMatch) {
      const fallbackMatch = content.match(/<div[^>]*class="architecture-diagram"[^>]*>([\s\S]*?)<\/div>/);
      return fallbackMatch ? fallbackMatch[0] : null;
    }
    
    return htmlMatch[1].trim();
  }

  /**
   * Extract text summary from AI response
   * @param {string} content - AI response content
   * @returns {string} Extracted summary
   */
  extractTextSummary(content) {
    const textRegex = /```text([\s\S]*?)```/;
    const match = content.match(textRegex);
    return match ? match[1].trim() : content.split('\n')[0] || "Technical summary";
  }

  /**
   * Extract recommendations from AI response
   * @param {string} content - AI response content
   * @returns {string[]} List of recommendations
   */
  extractRecommendations(content) {
    const recs = content.match(/Recommandations?.*([\s\S]*?)(?=\n\n|$)/i);
    return recs ? 
      recs[1].split('\n')
        .filter(r => r.trim().length > 0)
        .map(r => r.replace(/^- /, '').trim())
        .slice(0, 3) : 
      this.getDefaultRecommendations();
  }

  /**
   * Get default recommendations
   * @returns {string[]} Default recommendations
   */
  getDefaultRecommendations() {
    return [
      "Documentation: Ajouter des commentaires pour les fonctions principales",
      "Tests: Implémenter des tests unitaires pour les modules critiques",
      "Optimisation: Analyser les performances des composants clés"
    ];
  }

  /**
   * Wrap diagram in container HTML
   * @param {string} content - Diagram content
   * @returns {string} Wrapped diagram
   */
  wrapDiagram(content) {
    if (!content) return this.generateFallbackDiagram("No architecture diagram generated");
    
    return `
      <div class="architecture-diagram" style="
        font-family: 'Space Grotesk', sans-serif;
        background: rgba(42, 42, 58, 0.8);
        border-radius: 16px;
        padding: 2rem;
        margin: 1rem 0;
        width: 100%;
        box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow-x: auto;
      ">
        ${content}
      </div>
    `;
  }

  /**
   * Generate fallback diagram
   * @param {string} message - Error message
   * @returns {string} Fallback diagram HTML
   */
  generateFallbackDiagram(message) {
    return `
      <div class="diagram-fallback" style="
        padding: 2rem;
        text-align: center;
        background: rgba(255, 68, 168, 0.05);
        border-radius: 12px;
        border: 1px dashed var(--accent);
        width: 100%;
        box-sizing: border-box;
      ">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <p style="color: var(--accent); margin-top: 1rem; width: 100%;">${message}</p>
      </div>
    `;
  }

  /**
   * Generate fallback response
   * @param {Error} error - Error object
   * @returns {Object} Fallback response
   */
  generateFallbackResponse(error) {
    return {
      summary: `Analysis failed: ${error.message}`,
      htmlSchema: this.generateFallbackDiagram(error.message),
      recommendations: this.getFallbackRecommendations(),
      diagramSource: false
    };
  }

  /**
   * Get fallback recommendations
   * @returns {string[]} Fallback recommendations
   */
  getFallbackRecommendations() {
    return [
      "Verify API configuration",
      "Check repository accessibility",
      "Retry analysis later"
    ];
  }
}

module.exports = new AIService();