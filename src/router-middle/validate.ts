import * as validator from 'validator';
import * as R from 'ramda';
import * as _ from 'lodash';

function required() {
  return val => !!(val + '');
}

function lenLess(len) {
  return val => val.length < len;
}

function lenMore(len) {
  return val => val.length > len;
}

validator.required = required;
validator.lenLess = lenLess;
validator.lenMore = lenMore;

export function validate(validatedRule) {
  return (req, res, next) => {
    R.map(key => {
      const value = _.get(key);
      const rules = validatedRule[key];
      R.unless(
        rules =>
          rules.every(rule => {
            const [ruleFnName, params] = R.splitAt(1, rule.split(':'));
            return validator[ruleFnName].apply(null, params).call(null, value);
          }),
        () => {
          throw new Error('RequestError');
        }
      )(rules);
    })(Object.keys(validatedRule));
    next();
  };
}
