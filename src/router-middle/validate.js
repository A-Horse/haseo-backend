import validator from 'validator';
import R from 'ramda';
import _ from 'lodash';

function required() {
  return val => !!(val + '');
}

function lenLess(len) {
  return val => val.length < len;
}

function lenMore(len) {
  return val => val.length > len;
}

validate.required = required;
validate.lenLess = lenLess;
validate.lenMore = lenMore;

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
