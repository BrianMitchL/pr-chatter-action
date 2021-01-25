const core = require('@actions/core');
const github = require('@actions/github');

try {
  const context = github.context;

  if (context.payload.pull_request_review == null) {
    core.setFailed('No pull request review found.');
    return;
  }

  core.debug(context.payload.pull_request_review);
} catch (error) {
  core.setFailed(error.message);
}
