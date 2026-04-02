import { error, parseBasic } from 'npm:tiny-ts-parser';

type Type =
  | { tag: 'Boolean' }
  | { tag: 'Number' }
  | { tag: 'Func'; params: Param[]; retType: Type };

type Param = { name: string; type: Type };

type TypeEnv = Record<string, Type>;
