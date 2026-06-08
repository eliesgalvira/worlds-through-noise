import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const importExtensionsRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce .ts/.tsx extensions for local imports and extensionless package imports',
    },
    messages: {
      localRequiresExtension:
        "Local imports must use .ts or .tsx extensions. Change '{{source}}' to include the source extension.",
      localNoJs:
        "Local imports must use .ts or .tsx extensions, not .js/.jsx. Change '{{source}}' to '{{fixed}}'.",
      packageNoExtension:
        "Package imports must not have an extension. Change '{{source}}' to '{{fixed}}'.",
    },
    schema: [],
  },
  create(context) {
    function checkImportSource(node, source) {
      if (!source || typeof source !== 'string') {
        return
      }

      const isLocal =
        source.startsWith('./') ||
        source.startsWith('../') ||
        source.startsWith('@/')
      const isAsset =
        source.endsWith('.css') ||
        source.endsWith('.svg') ||
        source.endsWith('.png') ||
        source.endsWith('.jpg') ||
        source.endsWith('.jpeg') ||
        source.endsWith('.webp') ||
        source.endsWith('.json') ||
        source.includes('?')

      if (isLocal) {
        if (isAsset) {
          return
        }

        if (source.endsWith('.js') || source.endsWith('.jsx')) {
          const fixed = source.replace(
            /\.jsx?$/,
            source.endsWith('.jsx') ? '.tsx' : '.ts',
          )
          context.report({
            node,
            messageId: 'localNoJs',
            data: { source, fixed },
          })
          return
        }

        if (!source.endsWith('.ts') && !source.endsWith('.tsx')) {
          context.report({
            node,
            messageId: 'localRequiresExtension',
            data: { source },
          })
        }
        return
      }

      if (
        source.endsWith('.ts') ||
        source.endsWith('.tsx') ||
        source.endsWith('.js') ||
        source.endsWith('.jsx')
      ) {
        const fixed = source.replace(/\.(tsx?|jsx?)$/, '')
        context.report({
          node,
          messageId: 'packageNoExtension',
          data: { source, fixed },
        })
      }
    }

    return {
      ExportAllDeclaration(node) {
        checkImportSource(node, node.source?.value)
      },
      ExportNamedDeclaration(node) {
        if (node.source) {
          checkImportSource(node, node.source.value)
        }
      },
      ImportDeclaration(node) {
        checkImportSource(node, node.source?.value)
      },
      ImportExpression(node) {
        if (node.source?.type === 'Literal') {
          checkImportSource(node, node.source.value)
        }
      },
    }
  },
}

const noDisableValidationRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow disableValidation: true in Schema operations',
    },
    messages: {
      noDisableValidation:
        'Do not use { disableValidation: true }. Fix the data or schema instead of disabling validation.',
    },
    schema: [],
  },
  create(context) {
    return {
      Property(node) {
        const keyMatches =
          (node.key?.type === 'Identifier' &&
            node.key.name === 'disableValidation') ||
          (node.key?.type === 'Literal' &&
            node.key.value === 'disableValidation')

        if (
          keyMatches &&
          node.value?.type === 'Literal' &&
          node.value.value === true
        ) {
          context.report({ node, messageId: 'noDisableValidation' })
        }
      },
    }
  },
}

const preferOptionFromNullableRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer Option.fromNullable over ternary Option.some/Option.none',
    },
    messages: {
      preferFromNullable:
        'Use Option.fromNullable({{name}}) instead of ternary Option.some/Option.none.',
    },
    schema: [],
  },
  create(context) {
    return {
      ConditionalExpression(node) {
        const { test, consequent, alternate } = node
        if (test.type !== 'BinaryExpression') {
          return
        }
        if (test.operator !== '!==' && test.operator !== '!=') {
          return
        }

        let testedName = null
        if (
          test.left.type === 'Identifier' &&
          test.right.type === 'Literal' &&
          test.right.value === null
        ) {
          testedName = test.left.name
        } else if (
          test.right.type === 'Identifier' &&
          test.left.type === 'Literal' &&
          test.left.value === null
        ) {
          testedName = test.right.name
        } else if (
          test.left.type === 'MemberExpression' &&
          test.right.type === 'Literal' &&
          test.right.value === null
        ) {
          testedName = context.getSourceCode().getText(test.left)
        } else if (
          test.right.type === 'MemberExpression' &&
          test.left.type === 'Literal' &&
          test.left.value === null
        ) {
          testedName = context.getSourceCode().getText(test.right)
        }
        if (!testedName) {
          return
        }

        if (
          consequent.type !== 'CallExpression' ||
          alternate.type !== 'CallExpression'
        ) {
          return
        }

        const consequentCallee = consequent.callee
        const alternateCallee = alternate.callee
        const isOptionSome =
          consequentCallee.type === 'MemberExpression' &&
          consequentCallee.object.type === 'Identifier' &&
          consequentCallee.object.name === 'Option' &&
          consequentCallee.property.type === 'Identifier' &&
          consequentCallee.property.name === 'some'
        const isOptionNone =
          alternateCallee.type === 'MemberExpression' &&
          alternateCallee.object.type === 'Identifier' &&
          alternateCallee.object.name === 'Option' &&
          alternateCallee.property.type === 'Identifier' &&
          alternateCallee.property.name === 'none'

        if (isOptionSome && isOptionNone) {
          context.report({
            node,
            messageId: 'preferFromNullable',
            data: { name: testedName },
          })
        }
      },
    }
  },
}

const noLocalStorageRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow localStorage usage',
    },
    messages: {
      noLocalStorage:
        'Do not use localStorage. Prefer typed persistence boundaries or React state for UI-only state.',
    },
    schema: [],
  },
  create(context) {
    return {
      Identifier(node) {
        if (node.name !== 'localStorage') {
          return
        }

        if (
          node.parent.type === 'MemberExpression' &&
          node.parent.property === node
        ) {
          const obj = node.parent.object
          if (
            obj.type === 'Identifier' &&
            (obj.name === 'window' || obj.name === 'globalThis')
          ) {
            context.report({ node: node.parent, messageId: 'noLocalStorage' })
          }
          return
        }

        context.report({ node, messageId: 'noLocalStorage' })
      },
    }
  },
}

const pipeMaxArgumentsRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow very long .pipe() calls',
    },
    messages: {
      tooManyArgs:
        '.pipe() has {{count}} arguments. Split the flow into named intermediate values or multiple pipes.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee
        if (
          callee.type === 'MemberExpression' &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'pipe' &&
          node.arguments.length > 20
        ) {
          context.report({
            node,
            messageId: 'tooManyArgs',
            data: { count: node.arguments.length },
          })
        }
      },
    }
  },
}

const noEffectMemberRule = (memberName, messageId, message) => ({
  meta: {
    type: 'problem',
    docs: {
      description: `Disallow Effect.${memberName}`,
    },
    messages: {
      [messageId]: message,
    },
    schema: [],
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'Effect' &&
          node.property.type === 'Identifier' &&
          node.property.name === memberName
        ) {
          context.report({ node, messageId })
        }
      },
    }
  },
})

const noSilentErrorSwallowRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow catch handlers that silently swallow errors',
    },
    messages: {
      noSilentSwallow:
        'Do not silently swallow errors with () => Effect.void. Propagate, transform, log, or recover explicitly.',
    },
    schema: [],
  },
  create(context) {
    function isEffectVoidOrUnit(node) {
      return (
        node?.type === 'MemberExpression' &&
        node.object.type === 'Identifier' &&
        node.object.name === 'Effect' &&
        node.property.type === 'Identifier' &&
        (node.property.name === 'void' || node.property.name === 'unit')
      )
    }

    function isVoidReturningHandler(node) {
      if (!node) {
        return false
      }
      if (node.type === 'ArrowFunctionExpression') {
        if (isEffectVoidOrUnit(node.body)) {
          return true
        }
        if (node.body.type === 'BlockStatement') {
          const body = node.body.body
          return (
            body.length === 1 &&
            body[0]?.type === 'ReturnStatement' &&
            isEffectVoidOrUnit(body[0].argument)
          )
        }
      }
      if (node.type === 'FunctionExpression') {
        const body = node.body.body
        return (
          body.length === 1 &&
          body[0]?.type === 'ReturnStatement' &&
          isEffectVoidOrUnit(body[0].argument)
        )
      }
      return false
    }

    function catchCallName(node) {
      if (node.type !== 'CallExpression') {
        return null
      }
      const callee = node.callee
      if (
        callee.type === 'MemberExpression' &&
        callee.object.type === 'Identifier' &&
        callee.object.name === 'Effect' &&
        callee.property.type === 'Identifier' &&
        (callee.property.name === 'catchTag' ||
          callee.property.name === 'catchAll' ||
          callee.property.name === 'catchTags')
      ) {
        return callee.property.name
      }
      return null
    }

    return {
      CallExpression(node) {
        const catchType = catchCallName(node)
        if (!catchType) {
          return
        }

        if (catchType === 'catchTags') {
          const obj = node.arguments[0]
          if (obj?.type !== 'ObjectExpression') {
            return
          }
          for (const prop of obj.properties) {
            if (
              prop.type === 'Property' &&
              isVoidReturningHandler(prop.value)
            ) {
              context.report({ node: prop.value, messageId: 'noSilentSwallow' })
            }
          }
          return
        }

        const handler =
          catchType === 'catchTag' ? node.arguments[1] : node.arguments[0]
        if (isVoidReturningHandler(handler)) {
          context.report({ node: handler, messageId: 'noSilentSwallow' })
        }
      },
    }
  },
}

const noVoidExpressionRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow void expressions',
    },
    messages: {
      noVoidExpression:
        "'void {{expression}}' evaluates an expression and discards it. Remove it or use the value.",
    },
    schema: [],
  },
  create(context) {
    return {
      UnaryExpression(node) {
        if (node.operator === 'void') {
          context.report({
            node,
            messageId: 'noVoidExpression',
            data: {
              expression: context.getSourceCode().getText(node.argument),
            },
          })
        }
      },
    }
  },
}

const localPlugin = {
  rules: {
    'import-extensions': importExtensionsRule,
    'no-disable-validation': noDisableValidationRule,
    'prefer-option-from-nullable': preferOptionFromNullableRule,
    'no-localstorage': noLocalStorageRule,
    'pipe-max-arguments': pipeMaxArgumentsRule,
    'no-effect-asvoid': noEffectMemberRule(
      'asVoid',
      'noEffectAsVoid',
      'Effect.asVoid is usually unnecessary. Prefer a void success type at the boundary.',
    ),
    'no-effect-catchallcause': noEffectMemberRule(
      'catchAllCause',
      'noEffectCatchAllCause',
      'Do not use Effect.catchAllCause for expected errors. Use catchAll or catchTag.',
    ),
    'no-effect-ignore': noEffectMemberRule(
      'ignore',
      'noEffectIgnore',
      'Do not use Effect.ignore. Handle errors explicitly or propagate them.',
    ),
    'no-service-option': noEffectMemberRule(
      'serviceOption',
      'noServiceOption',
      'Do not use Effect.serviceOption. Services should be present in the provided context.',
    ),
    'no-silent-error-swallow': noSilentErrorSwallowRule,
    'no-void-expression': noVoidExpressionRule,
  },
}

export default defineConfig([
  globalIgnores([
    'dist/**',
    'node_modules/**',
    '.repos/**',
    'coverage/**',
    '*.gen.ts',
    '*.gen.tsx',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      local: localPlugin,
    },
    rules: {
      'local/import-extensions': 'error',
      'local/no-disable-validation': 'error',
      'local/no-effect-asvoid': 'error',
      'local/no-effect-catchallcause': 'error',
      'local/no-effect-ignore': 'error',
      'local/no-localstorage': 'error',
      'local/no-service-option': 'error',
      'local/no-silent-error-swallow': 'error',
      'local/no-void-expression': 'error',
      'local/pipe-max-arguments': 'error',
      'local/prefer-option-from-nullable': 'error',

      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'separate-type-imports', prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'error',
      'no-fallthrough': 'off',
      'no-redeclare': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true },
      ],
      'require-yield': 'off',
    },
  },
  prettierConfig,
])
