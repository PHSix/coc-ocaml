import util from 'util';
import { exec } from 'child_process';
const execPromise = util.promisify(exec);

// Opam environment management
export const opam = {
  async getEnv(cwd: string): Promise<{[key: string]: string}> {
    try {
      const { stdout } = await execPromise('opam env --sexp', { cwd });
      return this.parseSexpEnv(stdout);
    } catch (error) {
      console.error('Failed to get opam environment:', error);
      return process.env as {[key: string]: string};
    }
  },

  parseSexpEnv(sexp: string): {[key: string]: string} {
    const env: {[key: string]: string} = {};
    const regex = /\(([^ ]+) "([^"]+)"\)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(sexp))) {
      const [_, key, value] = match;
      env[key] = value;
    }

    return env;
  }
};

