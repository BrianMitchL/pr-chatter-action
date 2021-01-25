const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const githubToken = core.getInput('GITHUB_TOKEN');

    const context = github.context;

    if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.');
      return;
    }

    core.debug(JSON.stringify(context.payload.pull_request, null, 2));
    core.debug(JSON.stringify(context.payload.pull_request.review, null, 2));

    const octokit = github.getOctokit(githubToken);

    if (context.payload.pull_request.review.state === 'approved') {
      await octokit.issues.createComment({
        ...context.repo,
        issue_number: context.payload.pull_request.number,
        body: 'Good job, you wrote some good code.',
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
