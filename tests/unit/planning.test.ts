import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { buildViews, validatePlanning } from "../../scripts/planning.mjs";

const model = () => JSON.parse(fs.readFileSync("documentation/planning/work-items.json", "utf8"));
describe("planning integrity and evidence gates", () => {
  it("validates the proposed solo plan without asserting work is complete", () => {
    const data = model();
    expect(() => validatePlanning(data)).not.toThrow();
    expect(buildViews(data)["DASHBOARD.md"]).toContain("0/72 tasks");
  });
  it("refuses Done without a verification result and evidence", () => {
    const data = model(); data.tasks[0].status = "Done";
    expect(() => validatePlanning(data)).toThrow("Done needs Pass and evidence");
  });
  it("refuses progressing before prerequisites are complete", () => {
    const data = model(); data.tasks[1].status = "In progress";
    expect(() => validatePlanning(data)).toThrow("before dependency Done");
  });
  it("detects dependency cycles", () => {
    const data = model(); data.features[0].dependsOn = ["PB-003"];
    expect(() => validatePlanning(data)).toThrow("dependency cycle");
  });
  it("does not allow core delivery to depend on optional scope", () => {
    const data = model(); data.features[2].scope = "Stretch";
    expect(() => validatePlanning(data)).toThrow("Core depends on Stretch");
  });
  it("requires real dates, confirmed availability and buffer before commitment", () => {
    const data = model(); data.sprints[0].state = "Committed";
    expect(() => validatePlanning(data)).toThrow("Committed sprint needs dates/capacity");
    data.sprints[0].start = "2026-11-02"; data.sprints[0].end = "2026-11-15";
    data.team.hoursPerWeek = 20; data.sprints[0].capacityPoints = 10;
    expect(() => validatePlanning(data)).toThrow("Core exceeds capacity");
  });
  it("only derives feature completion when all its verified tasks are done", () => {
    const data = model();
    for (const task of data.tasks.slice(0, 3)) {
      task.status = "Done"; task.verification = "Pass"; task.evidence = ["README.md"];
    }
    validatePlanning(data);
    expect(buildViews(data)["DASHBOARD.md"]).toContain("3/72 tasks");
    expect(buildViews(data)["product-backlog.csv"]).toContain('"Done"');
  });
  it("reports partial feature delivery as in progress rather than still planned", () => {
    const data = model();
    data.tasks[0].status = "Done"; data.tasks[0].verification = "Pass";
    data.tasks[0].evidence = ["README.md"];
    validatePlanning(data);
    expect(buildViews(data)["product-backlog.csv"]).toContain('"In progress"');
  });
});
