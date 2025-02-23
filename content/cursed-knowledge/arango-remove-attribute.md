---
title: "Arango Remove Attribute"
description: "When updating documents, ArangoDB only touches the attributes specified in the `WITH` clause."
date: "2025-02-10"
tags: ["cursed-knowledge", "arangodb"]
---

When searching for a way to remove an attribute in an ArangoDB document, I found the `UNSET` function. Unfortunately, this sets the attribute to `null` which is not what I intended.

I found [this StackOverflow](https://stackoverflow.com/a/45982365/1725657) answer that resolves the issue.

```sql
FOR doc IN Collection
UPDATE doc WITH { my_key: null } IN Collection
OPTIONS { keepNull: false }
```

`keepNull: false` may sound scary if you have `null` attributes already in the document that you want to preserve, but the **cursed part** is when updating documents, ArangoDB only touches the attributes specified in the `WITH` clause.
