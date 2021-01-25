const core = require('@actions/core');
const github = require('@actions/github');

async function action() {
  try {
    const githubToken = core.getInput('GITHUB_TOKEN');

    const context = github.context;

    if (context.payload.pull_request == null) {
      core.setFailed('No pull request review found.');
      return;
    }

    core.debug(JSON.stringify(context.payload.pull_request, null, 2));

    const octokit = github.getOctokit(githubToken);
    await octokit.issues.createComment({
      ...context.repo,
      issue_number: context.payload.pull_request.number,
      body: "This is the coolest Pull Request I've ever seen!",
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

action();
