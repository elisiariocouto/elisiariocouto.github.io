---
title: "Git LFS Migrate All Branches"
date: 2019-11-14T14:32:01Z
description: "Migrating big files to LFS from a pre-existing Git repository using BFG Repo Cleaner versus `git-lfs`."
tags: ["git", "git-lfs"]
---

> Git is a distributed version control system, meaning the entire history of the
repository is transferred to the client during the cloning process.
**For projects containing large files, particularly large files that are
modified regularly, this initial clone can take a huge amount of time**, as
every version of every file has to be downloaded by the client. **Git LFS**
(Large File Storage) is a Git extension developed by Atlassian, GitHub, and
a few other open source contributors, that **reduces the impact of large files
in your repository by downloading the relevant versions of them lazily**.
Specifically, large files are downloaded during the checkout process rather
than during cloning or fetching. [^1]

[^1]: *[Atlassian Git LFS Tutorial](https://www.atlassian.com/git/tutorials/git-lfs)*

My quest was simple: migrate all the binary files in a repository to
Git LFS in all branches without breaking stuff.

After searching a bit, I found multiple ways of achieving this.

- **[BFG Repo Cleaner](https://github.com/rtyley/bfg-repo-cleaner)**
- **[`git-lfs`](https://github.com/git-lfs/git-lfs)**

### Round 1: Git LFS ❌
My first try was to use `git lfs migrate import --include="*.jpg,*.png`
directly into my freshly cloned version of the repo:

```shell
migrate: Fetching remote refs: ..., done
migrate: Sorting commits: ..., done
Error in git rev-list --stdin --reverse --topo-order --do-walk --: exit status 128 fatal: bad revision '^refs/remotes/origin/1.0'
```

Found that you can include the git *refs* you want, but I wanted a way of
migrating all the files in all the branches automatically.
Many tutorials that I've found online refer to BFG Repo Cleaner
so let's give it a try.

### Round 2: BFG ❌

Installed Java and BFG, cloned a bare version of the repo using
`git clone --mirror <git-repo>` and ran the tool pointing to the bare repo:

```shell
bfg --convert-to-git-lfs "*.{jpg,png}" --no-blob-protection <git-repo>.git
```

This was indeed fast, but I've found that BFG adds a `.gitattributes` file
inside every folder where it finds a to-be tracked LFS file. This was not
the way I intended it to be, I prefer a single `.gitattributes` file in the
the repo's root directory.

Also, I don't know why, but when I cloned the post-BFG repo, Git LFS didn't
download the files. 🤷‍♂️

### Round 3: Git LFS (again) ✅
Next thing was to try to run Git LFS on the bare repo:

```shell
git clone --mirror <git-repo>
cd <git-repo>.git
git lfs migrate import --include="*.jpg,*.png" --everything
git push --force
```

The remote denied the `git push --force` because of the protected branches and
tags on GitLab, but after I've unlocked them, it worked 🎉

All the files were moved to the LFS storage, the history was rewritten to have
the new file pointers and the `.gitattributes` files were added in the
root directory in every git *ref*.

I forgot to enable the `--everything` switch on my first run, maybe that works
as well, but the bare-repo clone was faster anyway.
