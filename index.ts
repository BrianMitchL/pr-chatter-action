import * as core from '@actions/core';
import * as github from '@actions/github';
import fetch from 'node-fetch';
import { randomInArray, findKeyword } from './utils';

type TenorResults = {
  media: {
    gif: {
      url: string;
      size: number;
    };
    tinygif: {
      url: string;
      size: number;
    };
  }[];
}[];

function getRandomGif(results: TenorResults) {
  if (results.length > 0) {
    const result = randomInArray(results);
    if (result.media[0]) {
      // ~5MB
      return result.media[0].gif.size < 5000000
        ? result.media[0].gif.url
        : result.media[0].tinygif.url;
    }
    core.debug('no media found in random tenor result');
  }
  core.debug('no results in tenor response');
}

async function fetchGif(
  tenorApiKey: string,
  keyword: string
): Promise<null | string> {
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
      const json = (await response.json()) as { results: TenorResults };
      const url = getRandomGif(json.results);
      if (url) {
        return `![${keyword} - Via Tenor](${url})`;
      }
      return null;
    } else {
      return null;
    }
  } catch (e) {
    if (e instanceof Error) {
      core.debug(e.message);
    }
    return null;
  }
}

function parseKeywordConfig(configString: string): string {
  const words = configString.split(',').map((keyword) => keyword.trim());
  return randomInArray(words);
}

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('GITHUB_TOKEN');
    const tenorApiKey = core.getInput('TENOR_API_KEY', { required: true });
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

    if (context.payload.review == null) {
      core.setFailed('No pull request review found.');
      return;
    }

    const approvedGifKeyword = parseKeywordConfig(
      core.getInput('approved-gif-keywords')
    );
    const changesRequestedGifKeyword = parseKeywordConfig(
      core.getInput('changes-requested-gif-keywords')
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
        await octokit.rest.issues.createComment({
          ...context.repo,
          issue_number: context.payload.pull_request.number,
          body: gifMarkdown,
        });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
