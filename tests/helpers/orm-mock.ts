export type OrmCommand = {
  operation: string;
  entity: string;
  parameters: Record<string, unknown>;
  changes: Record<string, unknown>;
  condition: string;
};
export function createOrmMock(
  execute: (command: OrmCommand) => Promise<unknown[]>,
) {
  function createQueryBuilder() {
    const command: OrmCommand = {
      operation: "select",
      entity: "",
      parameters: {},
      changes: {},
      condition: "",
    };
    const builder: Record<string, unknown> = {};
    const target = (value: unknown) =>
      typeof value === "string"
        ? value
        : (value as { options: { name: string } }).options.name;
    for (const method of [
      "select",
      "addSelect",
      "distinct",
      "distinctOn",
      "innerJoin",
      "orderBy",
      "addOrderBy",
      "limit",
      "setLock",
      "updateEntity",
      "orIgnore",
      "orUpdate",
      "returning",
    ])
      builder[method] = () => builder;
    builder.from = (value: unknown) => {
      command.entity = target(value);
      return builder;
    };
    builder.into = builder.from;
    builder.insert = () => {
      command.operation = "insert";
      return builder;
    };
    builder.update = (value: unknown) => {
      command.operation = "update";
      command.entity = target(value);
      return builder;
    };
    builder.delete = () => {
      command.operation = "delete";
      return builder;
    };
    builder.setParameters = (parameters: Record<string, unknown>) => {
      command.parameters = { ...command.parameters, ...parameters };
      return builder;
    };
    builder.where = (
      condition: string,
      parameters?: Record<string, unknown>,
    ) => {
      command.condition = condition;
      command.parameters = { ...command.parameters, ...parameters };
      return builder;
    };
    builder.set = (changes: Record<string, unknown>) => {
      command.changes = changes;
      return builder;
    };
    builder.values = builder.set;
    builder.getRawMany = () => execute(command);
    builder.execute = async () => ({ raw: await execute(command) });
    return builder;
  }
  return { createQueryBuilder };
}
