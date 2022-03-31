import * as path from 'node:path';
import * as glob from '@actions/glob';

export const getMatchingGlobPaths = async (workingDirectory: string, globPaths: readonly string[]): Promise<readonly string[]> => {
  const globber = await glob.create(globPaths.join('\n'), {
    implicitDescendants: false,
  });

  const paths = await globber.glob();

  return paths.map((file) => {
    return path.relative(workingDirectory, file);
  });
};
