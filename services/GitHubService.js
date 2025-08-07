const axios = require('axios');
const logger = require('../utils/logger');

class GitHubService {
  static async getRepoInfo(repoPath) {
    try {
      const url = `https://api.github.com/repos/${repoPath}`;
      
      logger.debug(`Requête GitHub: ${url}`);

      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitInspect-App'
        },
        timeout: 5000
      });

      return this.formatRepoData(response.data);
    } catch (error) {
      logger.error(`GitHub API Error: ${error.response?.status || error.code}`);
      throw this.handleGitHubError(error);
    }
  }

  static formatRepoData(data) {
    return {
      name: data.name,
      owner: data.owner.login,
      description: data.description,
      url: data.html_url,
      stars: data.stargazers_count,
      forks: data.forks_count,
      issues: data.open_issues_count,
      language: data.language,
      license: data.license?.spdx_id,
      createdAt: new Date(data.created_at).toLocaleDateString(),
      updatedAt: new Date(data.updated_at).toLocaleDateString(),
      size: `${(data.size / 1024).toFixed(1)} MB`,
      topics: data.topics || []
    };
  }

  static handleGitHubError(error) {
    const status = error.response?.status;
    if (status === 404) {
      return new Error('Dépôt non trouvé');
    } else if (status === 403) {
      return new Error('Limite de requêtes GitHub atteinte');
    } else {
      return new Error('Erreur de communication avec GitHub');
    }
  }
}

module.exports = GitHubService;