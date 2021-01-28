# pr-chatter-action

Intelligent GIF replies for Pull Request approvals and when changes are
requested.

The action looks at the review body text and analyzes the sentiment of the
text to influence the keyword used for finding a GIF.

This action is designed to be run on the `pull_request_review` event

```yaml
on:
  pull_request_review:
    types: [submitted]
```

## Inputs

### `TENOR_API_KEY`

**Required** Key for the Tenor GIFs API

### `GITHUB_TOKEN`

**Optional** Github Token for authentication

GitHub token used for posting comments on the PR. This defaults
to using the built-in GitHub token for the repository and comments
as the "github-actions" bot. You can set this as a personal access
token (PAT) if you want to comment as another account.

### `approved-gif-keywords`

**Optional** Comma separated string of keywords to randomly use for embedding
PR approved GIFs

This defaults to `'amazing, approve, awesome, great work, good job, hooray, incredible, joy, looks good, nice, perfect, thumbs up, wonderful'`

### `changes-requested-gif-keywords`

**Optional** Comma separated string of keywords to randomly use for embedding
PR changes requested GIFs

This defaults to `'try again, review, at least you tried, so close, dumpster fire, terrible, awful, disgusting, sad'`

## Usage

```yaml
# run the action on the `pull_request_review` event
on:
  pull_request_review:
    types: [submitted]

# later in the job steps
- uses: BrianMitchL/pr-chatter-action@v1
  with:
    # required
    TENOR_API_KEY: ${{ secrets.TENOR_API_KEY }}
    # optional
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    # optional
    approved-gif-keywords: 'amazing, approve, awesome, great work, good job, hooray, incredible, joy, looks good, nice, perfect, thumbs up, wonderful'
    # optional
    changes-requested-gif-keywords: 'try again, review, at least you tried, so close, dumpster fire, terrible, awful, disgusting, sad'
```
