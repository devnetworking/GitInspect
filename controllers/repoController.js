const GitHubService = require('../services/GitHubService');
const AIService = require('../services/AIService');
const logger = require('../utils/logger');

module.exports = {
  inspectRepository: async (req, res, next) => {
    try {
      const { owner, repo } = req.params;
      const repoPath = `${owner}/${repo}`;
      
      // 1. Get GitHub info
      const repoInfo = await GitHubService.getRepoInfo(repoPath);
      logger.info('GitHub data:', { 
        name: repoInfo.name, 
        language: repoInfo.language 
      });
      
      // 2. AI Analysis
      const analysis = await AIService.analyzeRepository(repoInfo);
      logger.info('Analysis completed', {
        summaryLength: analysis.summary.length,
        hasDiagram: !!analysis.htmlSchema
      });
      
      // 3. Render results
      res.render('results', {
        title: `GitInspect - ${repoInfo.name}`,
        repo: repoInfo,
        analysis: {
          ...analysis,
          // Ensure htmlSchema is always defined
          htmlSchema: analysis.htmlSchema || AIService.generateFallbackDiagram("No diagram generated")
        }
      });
      
    } catch (error) {
      logger.error('Controller error:', error);
      
      // Render error page with fallback data
      res.render('results', {
        title: 'Erreur d\'analyse',
        repo: { name: 'Erreur', description: '' },
        analysis: {
          summary: "Une erreur est survenue",
          htmlSchema: AIService.generateFallbackDiagram(error.message),
          recommendations: [
            "Actualiser la page",
            "Vérifier le nom du dépôt",
            "Contacter le support"
          ]
        }
      });
    }
  },

  // Debug route
  debugDiagram: async (req, res) => {
    res.render('results', {
      title: 'Debug Diagram',
      repo: {
        name: "Debug Repo",
        description: "Test d'affichage du diagramme",
        html_url: "#",
        language: "JavaScript"
      },
      analysis: {
        summary: "Ceci est un test d'affichage",
        htmlSchema: `
          <div class="architecture-diagram">
            <h3>Architecture de Test</h3>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
              <div style="
                background: rgba(110, 68, 255, 0.1);
                padding: 1.5rem;
                border-radius: 12px;
                border: 1px solid var(--primary);
                text-align: center;
              ">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                <p>Frontend</p>
              </div>
              <div style="
                background: rgba(184, 146, 255, 0.1);
                padding: 1.5rem;
                border-radius: 12px;
                border: 1px solid var(--secondary);
                text-align: center;
              ">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" stroke-width="2">
                  <path d="M20 17a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5"></path>
                  <path d="M4 17a2 2 0 0 1 2-2h7"></path>
                  <path d="M16 21V11a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v10"></path>
                </svg>
                <p>Backend</p>
              </div>
            </div>
          </div>
        `,
        recommendations: [
          "Ceci est une recommandation test 1",
          "Recommandation test 2",
          "Dernière recommandation test"
        ],
        diagramSource: true
      }
    });
  }
};