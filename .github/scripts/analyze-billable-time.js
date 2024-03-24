const { Octokit } = require("@octokit/rest");

const USER = process.env.USER;
const TOKEN = process.env.GIT_PAT;
const octokit = new Octokit({ auth: TOKEN });

async function fetchPrivateRepos() {
  await octokit
    .request(`GET /users/{username}/repos`, {
      username: USER,
      type: "public",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    .then((response) => {
      console.log("Repos:", response.data);
    })
    .catch((error) => {
      console.error("Error fetching repos:", error.message);
    });
}

// async function searchPrivateRepos() {
//   await octokit
//     .request("GET /search/repositories", {
//       headers: {
//         "X-GitHub-Api-Version": "2022-11-28",
//       },
//     })
//     .then((response) => {
//       console.log("Repos:", response.data);
//     })
//     .catch((error) => {
//       console.error("@@@@@@@@@@@@@@@ Error search repos:", error.message);
//     });
// }

async function fetchRepos(page = 1, repoArr = []) {
  const { data } = await octokit.rest.repos
    .listForAuthenticatedUser({
      visibility: "public",
      per_page: 100,
      page,
    })
    .catch((error) => {
      console.error("$$$$$$$$$$$$$$$:", error.message);
    });

  repoArr.push(
    ...data.map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      actionsUsed: repo.has_actions,
    }))
  );
  if (data.length === 100) {
    return await fetchRepos(page + 1, repoArr);
  }
  return repoArr;
}

async function getBillableTime() {
  const repos = await fetchRepos(); // fetch all private repos
  const reposWithActions = repos.filter((repo) => repo.actionsUsed); // find ones using Actions
  let billableTime = 0;

  for (const repo of reposWithActions) {
    const usage = await octokit.rest.actions.listRepoWorkflowRuns({
      owner: process.env.USER,
      repo: repo.name,
    });

    billableTime += usage.data.total_count;
  }

  console.table(reposWithActions);
  console.log("Total Billable time: ", billableTime);
}
fetchPrivateRepos();
getBillableTime().catch((err) => console.log("11111111111111111111111", err));
