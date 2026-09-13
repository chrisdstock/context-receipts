"""Repository-local reference helpers; validation is not authorization or attestation."""
from copy import deepcopy
from dataclasses import dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any, Mapping
from uuid import uuid4

from jsonschema import Draft202012Validator, FormatChecker
from rfc3339_validator import validate_rfc3339

FORMAT_CHECKER = FormatChecker()


@FORMAT_CHECKER.checks("date-time")
def _date_time(value):
    return not isinstance(value, str) or bool(validate_rfc3339(value.upper()))

SCHEMA_DIR = Path(__file__).resolve().parent.parent / 'schemas'


@dataclass(frozen=True)
class ValidationResult:
    valid: bool
    errors: tuple[str, ...]


def get_schema(version: str = '0.2') -> dict[str, Any]:
    """Return a fresh local schema. Never resolve a caller-supplied schema URL."""
    if version not in ('0.1', '0.2'):
        raise ValueError('Unsupported receipt version')
    return json.loads((SCHEMA_DIR / f'context-receipt-v{version}.schema.json').read_text())


def validate_context_receipt(receipt: Any) -> ValidationResult:
    """Validate shape and local consistency, without echoing potentially private values."""
    try:
        encoded = json.dumps(receipt, allow_nan=False)
        if len(encoded.encode('utf-8')) > 1_000_000 or json.loads(encoded) != receipt:
            return ValidationResult(False, ('Receipt must be bounded JSON data',))
    except (ValueError, TypeError, RecursionError):
        return ValidationResult(False, ('Receipt must be bounded JSON data',))
    if not isinstance(receipt, dict) or not isinstance(receipt.get('context_receipt'), dict):
        return ValidationResult(False, ('Missing receipt object',))
    body = receipt['context_receipt']
    version = body.get('schema_version')
    if version not in ('0.1', '0.2'):
        return ValidationResult(False, ('Unsupported receipt version',))
    validator = Draft202012Validator(get_schema(version), format_checker=FORMAT_CHECKER)
    # Error messages and property paths can contain user values, including unexpected keys.
    errors = [f'Schema rule failed: {error.validator}' for error in validator.iter_errors(receipt)]
    if not errors and version == '0.2':
        if body['receipt_id'] in body['binding']['parent_receipt_ids']:
            errors.append('Receipt cannot be its own parent')
        challenge = body['challenge_path']
        if challenge['state'] == 'disclosed':
            ids = [action['id'] for action in challenge['items']]
            if len(ids) != len(set(ids)):
                errors.append('Challenge action IDs must be unique')
    return ValidationResult(not errors, tuple(errors))


def create_context_receipt(input: Mapping[str, Any]) -> dict[str, Any]:
    """Create v0.2 metadata; all disclosures must be supplied, never guessed."""
    body = deepcopy(dict(input))
    body.setdefault('schema_version', '0.2')
    if body['schema_version'] != '0.2':
        raise ValueError('Creation supports v0.2 only')
    body.setdefault('receipt_id', str(uuid4()))
    body.setdefault('timestamp', datetime.now(timezone.utc).isoformat())
    receipt = {'context_receipt': body}
    result = validate_context_receipt(receipt)
    if not result.valid:
        raise ValueError('; '.join(result.errors))
    return receipt
