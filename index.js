const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
const { randomInArray, findKeyword } = require('./utils');

function getRandomGif(results) {
  if (results.length > 0) {
    const result = randomInArray(results);
    if (result.media[0]) {
      return result.media[0].gif.url;
    }
    core.debug('no media found in random tenor result');
  }
  core.debug('no results in tenor response');
}

async function fetchGif(tenorApiKey, keyword) {
  if (!tenorApiKey) {
    return null;
  }

  const params = new URLSearchParams();
  params.append('key', tenorApiKey);
  params.append('q', keyword);
  params.append('limit', '25');
  params.append('locale', 'en_US');
  params.append('contentfilter', 'medium');
  params.append('media_filter', 'minimal');

  try {
    const response = await fetch(
      `https://api.tenor.com/v1/search?${params.toString()}`
    );
    if (response.ok) {
      const json = await response.json();
      const url = getRandomGif(json.results);
      if (url) {
        return `![${keyword}](${url})`;
      }
      return null;
    } else {
      return null;
    }
  } catch (e) {
    core.debug(e.message);
    return null;
  }
}

function parseKeywordConfig(configString) {
  const words = configString.split(',').map((keyword) => keyword.trim());
  return randomInArray(words);
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
    const changesRequestedGifKeyword = parseKeywordConfig(
      core.getInput('changesRequestedGifKeywords')
    );

    const octokit = github.getOctokit(githubToken);

    const state = context.payload.review.state;

    if (['approved', 'changes_requested'].includes(state)) {
      const keyword = findKeyword({
        state,
        body: context.payload.review.body,
        fallbackApprove: approvedGifKeyword,
        fallbackChangesRequested: changesRequestedGifKeyword,
      });
      const gifMarkdown = await fetchGif(tenorApiKey, keyword);

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
