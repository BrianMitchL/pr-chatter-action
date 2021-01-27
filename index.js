const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

async function fetchGif(tenorApiKey, keyword) {
  if (!tenorApiKey) {
    return null;
  }

  const params = new URLSearchParams();
  params.append('key', tenorApiKey);
  params.append('q', keyword);
  params.append('limit', '1');
  params.append('contentfilter', 'medium');
  params.append('media_filter', 'minimal');

  try {
    const response = await fetch(
      `https://api.tenor.com/v1/search?${params.toString()}`
    );
    if (response.ok) {
      const json = await response.json();
      const url = json.results[0].media[0].gif.url;
      return `![${keyword}](${url})`;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

function parseKeywordConfig(configString) {
  const words = configString.split(',').map((keyword) => keyword.trim());
  return words[Math.floor(Math.random() * words.length)];
}

async function run() {
  try {
    const githubToken = core.getInput('GITHUB_TOKEN');
    const tenorApiKey = core.getInput('TENOR_API_KEY');
    if (!githubToken) {
      core.setFailed('No GitHub token set.');
      return;
    }

    if (!tenorApiKey) {
      core.setFailed('No Tenor API key set.');
      return;
    }

    const context = github.context;

    if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.');
      return;
    }

    const approvedGifKeyword = parseKeywordConfig(
      core.getInput('approvedGifKeywords')
    );
    const changedRequestedGifKeyword = parseKeywordConfig(
      core.getInput('changedRequestedGifKeywords')
    );

    core.debug(context.payload.action);
    core.debug(JSON.stringify(context.payload.pull_request, null, 2));
    core.debug(JSON.stringify(context.payload.review, null, 2));

    const octokit = github.getOctokit(githubToken);

    const state = context.payload.review.state;

    if (state === 'approved') {
      const gifMarkdown = await fetchGif(tenorApiKey, approvedGifKeyword);

      if (gifMarkdown) {
        await octokit.issues.createComment({
          ...context.repo,
          issue_number: context.payload.pull_request.number,
          body: gifMarkdown,
        });
      }
    } else if (state === 'changes_requested') {
      const gifMarkdown = await fetchGif(
        tenorApiKey,
        changedRequestedGifKeyword
      );

      if (gifMarkdown) {
        await octokit.issues.createComment({
          ...context.repo,
          issue_number: context.payload.pull_request.number,
          body: gifMarkdown,
        });
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
