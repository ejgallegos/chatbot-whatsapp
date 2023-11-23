module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "overrides": [
        {
            "files": ["packages/**/*.js"],
            "rules": {
                "no-unsafe-negation": "off",
                "no-prototype-builtins": "off",
                "no-useless-escape": "off"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "ignorePatterns": ["node_modules/", "starters/", "__test__", "base-**"]
}
