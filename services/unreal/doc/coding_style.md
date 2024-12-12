# Coding style

## `core`

For the `core` we use the following conventions (non-exhaustive). Please refer to- and remain consistent with existing code when in doubt. 

### Naming
- namespaces: `snake_case`
- variables (also constants): `camelCase`
- types (`class`, `struct`, `enum`, `typedef`, `using`): `PascalCase`
- function names: `camelCase`
- function parameters: `camelCase`, `out` prefix when modifying the parameter (e.g. `int* outFoo`). 
- no prefixes for variable names (no `pFoo` or `mBar`)
- a postfix can be added on naming collisions: e.g. ` size_t size_;` and `size_t size() const;`

### Indentations and newlines
- curly braces on a new line
- indenting using 4 spaces
- wrapped function parameters should be indented with 4 spaces:
```
void someLongFunction(
    int parameter,
    int other,
    int another);
```

## `unreal_plugin`

For the `unreal_plugin` module we use the naming conventions and code style of Unreal Engine, as dictated by: 

https://dev.epicgames.com/documentation/en-us/unreal-engine/epic-cplusplus-coding-standard-for-unreal-engine