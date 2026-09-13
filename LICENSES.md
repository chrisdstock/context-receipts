# License scope

Effective with the merge of the licensing update in PR #14:

| Material | Terms |
| --- | --- |
| Root Markdown documentation, `docs/`, `schemas/`, and examples except the exception below | CC0-1.0, full legal code in [LICENSE](LICENSE) |
| `context_receipts/`, `scripts/`, `tests/`, `.github/`, and reference packages with their own MIT notice | MIT; each code directory/package contains its full license notice |
| Root development configuration such as `.gitignore` and `requirements-dev.txt` | MIT, using the notice in [context_receipts/LICENSE](context_receipts/LICENSE) |

These grants cover rights the repository owner is authorized to grant. They do not
relicense dependencies, third-party trademarks, or separately identified material.
Code packages must ship their MIT notice and preserve any notices accompanying
bundled specification schemas.

## Legacy contribution exception

`examples/rag-retriever.yaml` incorporates material from Kushagra963-lab's
[PR #16](https://github.com/chrisdstock/context-receipts/pull/16), submitted before
this repository adopted licensing terms. Permission to apply CC0 or MIT to that
contribution has not been verified. This file is therefore excluded from the grants
above; no new public reuse license for it is asserted by this change. Preserve its
attribution. This notice does not retroactively establish or remove any other rights.

For a CC0 example of the current contract, use
[examples/v0.2/rag-retriever.json](examples/v0.2/rag-retriever.json), which was written
for the v0.2 update and is not copied from PR #16. The excluded legacy example is not
bundled in reference packages.

## Text provenance

CC0 legal code: https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt

MIT text: https://opensource.org/license/mit (retrieved via GitHub's license API).

The scope table is separate from the unmodified license texts. License terms are
not an assurance that context receipts are correct, private, or authorized.
