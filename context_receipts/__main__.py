"""python -m context_receipts FILE ... (JSON or JSON-compatible YAML)."""
import argparse
import json
from pathlib import Path
import sys

import yaml
from . import validate_context_receipt


class UniqueLoader(yaml.SafeLoader):
    pass


def unique_mapping(loader, node):
    pairs = loader.construct_pairs(node)
    result = {}
    for key, value in pairs:
        if not isinstance(key, str) or key in result:
            raise ValueError('Invalid or duplicate key')
        result[key] = value
    return result


UniqueLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, unique_mapping)


def unique_json(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('Duplicate key')
        result[key] = value
    return result


def load_receipt(path: Path):
    # Limit local CLI input; services must also enforce their own nesting and request budgets.
    with path.open('rb') as handle:
        raw = handle.read(1_000_001)
    if len(raw) > 1_000_000:
        raise ValueError('Receipt exceeds size limit')
    if path.suffix == '.json':
        data = json.loads(raw, object_pairs_hook=unique_json,
                          parse_constant=lambda _: (_ for _ in ()).throw(ValueError('Non-JSON number')))
    else:
        data = yaml.load(raw, Loader=UniqueLoader)
    # Reject YAML-only values (including unquoted dates) and non-finite numbers.
    json.dumps(data, allow_nan=False)
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', nargs='+', type=Path)
    args = parser.parse_args()
    failed = False
    for index, path in enumerate(args.files, 1):
        try:
            result = validate_context_receipt(load_receipt(path))
            print(f'Input {index}: ' + ('PASS' if result.valid else 'FAIL: ' + '; '.join(result.errors)))
            failed |= not result.valid
        except (OSError, ValueError, TypeError, RecursionError, yaml.YAMLError):
            # Parsing exceptions may include raw private content. Do not render them.
            print(f'Input {index}: FAIL: could not read a bounded JSON-compatible receipt')
            failed = True
    return int(failed)


if __name__ == '__main__':
    sys.exit(main())
