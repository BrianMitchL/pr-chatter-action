const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

async function fetchGif(tenorApiKey, keyword) {
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
      return json.results[0].media[0].gif.url;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function run() {
  try {
    const githubToken = core.getInput('GITHUB_TOKEN');
    const tenorApiKey = core.getInput('TENOR_API_KEY');
    const gifSuccessKeywords = core
      .getInput('gifSuccessKeywords')
      .split(',')
      .map((keyword) => keyword.trim());

    const context = github.context;

    if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.');
      return;
    }

    core.debug(context.payload.action);

    core.debug(JSON.stringify(context.payload.pull_request, null, 2));
    core.debug(JSON.stringify(context.payload.review, null, 2));

    const octokit = github.getOctokit(githubToken);

    if (context.payload.review && context.payload.review.state === 'approved') {
      let gifUrl = null;

      if (tenorApiKey) {
        const keyword =
          gifSuccessKeywords[
            Math.floor(Math.random() * gifSuccessKeywords.length)
          ];
        gifUrl = await fetchGif(tenorApiKey, keyword);
      }

      let message = 'Good job, you wrote some good code.';
      if (gifUrl) {
        message += `\n![GIF](${gifUrl})`;
      }

      await octokit.issues.createComment({
        ...context.repo,
        issue_number: context.payload.pull_request.number,
        body: message,
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
