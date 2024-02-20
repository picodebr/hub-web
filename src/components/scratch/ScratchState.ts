export class ScratchState {
  private workspace_: any;

  private variables_: string[];

  constructor() {
    this.workspace_ = {};
    this.variables_ = [];
  }

  public get workspace() {
    return this.workspace_;
  }

  public set workspace(workspace: any) {
    this.workspace_ = workspace;
  }

  public get variables() {
    return this.variables_;
  }

  public set variables(variables: string[]) {
    this.variables_ = variables;
  }
}

export const scratchState = new ScratchState();
