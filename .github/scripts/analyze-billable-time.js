const { Octokit } = require("@octokit/rest");

const USER = process.env.USER;
const TOKEN = process.env.GIT_PAT;
const octokit = new Octokit({ auth: TOKEN });

async function searchWorkflowsInRepositories() {
  try {
    const queryString = encodeURIComponent(
      "user:" + USER + "path:.github/workflows"
    );
    // const response = await octokit.search.repos({
    const response = await octokit.search.code({
      // q: `owner:${USER} .github/workflows`,
      // q: `"${USER}" path:.github/workflows`,
      // q: `path:.github/workflows`,
      // q: `owner%3Apavelpiha+.github%2Fworkflows`,
      q: queryString,
    });

    const repositoriesWithWorkflows = [];
    response.data.items.forEach((item) => {
      const repositoryName = item.repository.name;
      repositoriesWithWorkflows.push(repositoryName);
    });
    console.log("response.data", response);

    return repositoriesWithWorkflows;
  } catch (error) {
    console.error("Error searching workflows:", error);
    return [];
  }
}

async function main() {
  try {
    const repositories = await searchWorkflowsInRepositories();
    console.log("Repositories with Workflows:");
    console.log("------------------------------------------");
    repositories.forEach((repo) => {
      console.log(repo);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchRepos(page = 1, listOfRepositories = []) {
  const { data } = await octokit.rest.repos
    .listForAuthenticatedUser({
      visibility: "public",
      per_page: 100,
      page,
    })
    .catch((error) => {
      console.error("$$$$$$$$$$$$$$$:", error.message);
    });

  listOfRepositories.push(
    ...data.map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      actionsUsed: repo.has_actions,
    }))
  );
  if (data.length === 100) {
    return await fetchRepos(page + 1, repoArr);
  }
  console.log("!!!!!!listOfRepositories", listOfRepositories);
  return listOfRepositories;
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
// getBillableTime().catch((err) => console.log("11111111111111111111111", err));
main();
