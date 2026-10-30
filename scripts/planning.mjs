import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = "documentation/planning";
const table = (headers, rows) => [
  "| " + headers.join(" | ") + " |",
  "| " + headers.map(() => "---").join(" | ") + " |",
  ...rows.map(row => "| " + row.map(value => String(value ?? "TBD").replaceAll("|", "\\|").replace(/\s+/g, " ")).join(" | ") + " |"),
].join("\n");
const csv = rows => "\ufeff" + rows.map(row => row.map(value => '"' + String(value ?? "").replaceAll('"', '""') + '"').join(",")).join("\r\n") + "\r\n";
const generated = "> Generated view — chỉnh work-items.json rồi chạy npm run plan:sync\n\n";

export function validatePlanning(model) {
  const errors = [];
  const featureMap = new Map(model.features.map(feature => [feature.id, feature]));
  const taskMap = new Map(model.tasks.map(task => [task.id, task]));
  const sprintMap = new Map(model.sprints.map((sprint, index) => [sprint.id, { ...sprint, index }]));
  const externals = new Map(model.externalDependencies.map(item => [item.id, item]));
  if (featureMap.size !== model.features.length || taskMap.size !== model.tasks.length) errors.push("Duplicate feature/task ID");
  if (new Set(model.sprints.map(item => item.id)).size !== model.sprints.length) errors.push("Duplicate sprint ID");
  const epicIds = new Set(model.epics.map(item => item.id));
  const milestoneMap = new Map(model.milestones.map(item => [item.id, item]));
  for (const item of model.baseline) for (const file of [item.docs, item.audit])
    if (!fs.existsSync(file)) errors.push("Missing baseline evidence: " + file);
  const cycleCheck = (items, map, label) => {
    const active = new Set(), visited = new Set();
    const visit = id => {
      if (active.has(id)) { errors.push(label + " dependency cycle: " + id); return; }
      if (visited.has(id) || !map.has(id)) return;
      active.add(id);
      for (const dependency of map.get(id).dependsOn) visit(dependency);
      active.delete(id); visited.add(id);
    };
    for (const item of items) visit(item.id);
  };
  for (const item of model.features) {
    if (!epicIds.has(item.epic) || !item.acceptance.trim()) errors.push("Missing WBS/acceptance: " + item.id);
    if (!["P0", "P1", "P2"].includes(item.priority) || !["Core", "Stretch", "Deferred"].includes(item.scope)) errors.push("Invalid priority/scope: " + item.id);
    if (item.sprint && !sprintMap.has(item.sprint)) errors.push("Unknown sprint: " + item.id);
    if (item.sprint && !item.tasks.length) errors.push("Scheduled item has no tasks: " + item.id);
    if (item.points !== null && (!Number.isFinite(item.points) || item.points <= 0)) errors.push("Invalid estimate: " + item.id);
    for (const dependency of item.dependsOn) {
      const upstream = featureMap.get(dependency);
      if (!upstream) errors.push("Unknown feature dependency: " + dependency);
      else {
        if (item.sprint && upstream.sprint && sprintMap.get(item.sprint)?.index < sprintMap.get(upstream.sprint)?.index) errors.push("Dependency scheduled after item: " + item.id);
        if (item.scope === "Core" && upstream.scope === "Stretch") errors.push("Core depends on Stretch; replan: " + item.id);
      }
    }
    for (const id of item.tasks) if (taskMap.get(id)?.parent !== item.id) errors.push("Task parent mismatch: " + id);
    for (const id of item.external) if (!externals.has(id)) errors.push("Unknown external dependency: " + id);
  }
  for (const task of model.tasks) {
    if (!featureMap.has(task.parent) || !featureMap.get(task.parent).tasks.includes(task.id)) errors.push("Unmapped task: " + task.id);
    if (!model.states.includes(task.status) || !model.verificationStates.includes(task.verification)) errors.push("Invalid task state: " + task.id);
    for (const id of task.dependsOn) if (!taskMap.has(id)) errors.push("Unknown task dependency: " + id);
    if (task.status === "Done" && (task.verification !== "Pass" || !task.evidence.length)) errors.push("Done needs Pass and evidence: " + task.id);
    if (task.status === "Blocked" && !task.blocker.trim()) errors.push("Blocked needs reason: " + task.id);
    for (const evidence of task.evidence)
      if (!/^https?:\/\//.test(evidence) && !fs.existsSync(evidence)) errors.push("Missing task evidence: " + evidence);
    if (["In progress", "Review", "Done"].includes(task.status))
      for (const id of task.dependsOn) if (taskMap.get(id)?.status !== "Done") errors.push("Task progressed before dependency Done: " + task.id);
  }
  for (const milestone of model.milestones) {
    for (const id of milestone.requires) if (!featureMap.has(id)) errors.push("Unknown milestone prerequisite: " + id);
    for (const id of milestone.dependsOn) if (!milestoneMap.has(id)) errors.push("Unknown prior milestone: " + id);
  }
  for (const sprint of model.sprints) {
    if (!["Proposed", "Committed", "Active", "Closed"].includes(sprint.state)) errors.push("Invalid sprint state: " + sprint.id);
    if (sprint.state !== "Proposed") {
      if (!sprint.start || !sprint.end || !Number.isFinite(sprint.capacityPoints) || sprint.capacityPoints <= 0) errors.push("Committed sprint needs dates/capacity: " + sprint.id);
      const datesValid = [sprint.start, sprint.end].every(day => /^\d{4}-\d{2}-\d{2}$/.test(day)
        && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day);
      if (!datesValid || sprint.end < sprint.start) errors.push("Invalid sprint dates: " + sprint.id);
      const core = model.features.filter(item => item.sprint === sprint.id && item.scope === "Core").reduce((sum, item) => sum + (item.points ?? 0), 0);
      if (core > sprint.capacityPoints * .75) errors.push("Core exceeds capacity after25% reserve: " + sprint.id);
      if (!Number.isFinite(model.team.hoursPerWeek) || model.team.hoursPerWeek <= 0) errors.push("Committed sprint needs confirmed hours/week: " + sprint.id);
    }
  }
  cycleCheck(model.features, featureMap, "Feature"); cycleCheck(model.tasks, taskMap, "Task");
  cycleCheck(model.milestones, milestoneMap, "Milestone");
  if (errors.length) throw new Error(errors.join("\n"));
}

export function buildViews(model) {
  const byTask = new Map(model.tasks.map(task => [task.id, task]));
  const byFeature = new Map(model.features.map(feature => [feature.id, feature]));
  const allDone = item => item.tasks.length > 0 && item.tasks.every(id => byTask.get(id).status === "Done");
  const status = item => !item.tasks.length ? "Backlog" : allDone(item) ? "Done"
    : item.tasks.some(id => byTask.get(id).status === "Blocked") ? "Blocked"
    : item.tasks.every(id => ["Done", "Review"].includes(byTask.get(id).status)) ? "Review"
    : item.tasks.some(id => byTask.get(id).status !== "Todo") ? "In progress" : "Planned";
  const milestoneReady = item => item.requires.every(id => allDone(byFeature.get(id)))
    && item.dependsOn.every(id => milestoneReady(model.milestones.find(gate => gate.id === id)));
  const ready = task => {
    const item = byFeature.get(task.parent);
    if (task.status === "Done") return "Done";
    if (task.status === "Blocked") return "Blocked: " + task.blocker;
    if (task.dependsOn.some(id => byTask.get(id).status !== "Done")) return "Waiting dependencies";
    if (item.refinement !== "Ready") return "Needs refinement";
    const waiting = item.external.filter(id => !/^(Available|Confirmed)/.test(model.externalDependencies.find(ext => ext.id === id).status));
    return waiting.length ? "External: " + waiting.join(", ") : "Ready";
  };
  const totals = tasks => {
    const done = tasks.filter(task => task.status === "Done").length;
    return done + "/" + tasks.length + " tasks (" + (tasks.length ? Math.round(done / tasks.length * 100) : 0) + "% count-based)";
  };
  const sprintRows = model.sprints.map(sprint => {
    const items = model.features.filter(item => item.sprint === sprint.id);
    const tasks = model.tasks.filter(task => items.some(item => item.id === task.parent));
    return [sprint.id + " / " + sprint.name, sprint.state, sprint.start ?? "TBD", sprint.end ?? "TBD",
      items.filter(item => item.scope === "Core").reduce((sum, item) => sum + (item.points ?? 0), 0),
      items.filter(item => item.scope === "Stretch").reduce((sum, item) => sum + (item.points ?? 0), 0),
      items.filter(allDone).reduce((sum, item) => sum + (item.points ?? 0), 0),
      totals(tasks)];
  });
  const outputs = {};
  outputs["DASHBOARD.md"] = generated + "# Tracking EverLang — " + model.asOf + "\n\n"
    + "Baseline " + model.baselineCommit + ": " + model.baseline.length + " feature/domain hiện có, tách khỏi backlog mới. Không tính % hoàn thành toàn bộ dự án.\n\n"
    + "Phần bổ sung: " + model.features.length + " PBIs; " + totals(model.tasks) + ". "
    + model.features.filter(item => !item.sprint).length + " PBIs deferred chưa chia task/estimate. Task count không phải effort/burndown.\n\n"
    + table(["Sprint", "Trạng thái", "Start", "End", "Core dev SP*", "Stretch dev SP*", "Done dev SP*", "Tiến độ"], sprintRows)
    + "\n\n*SP sơ bộ, không phải giờ/ngày. Content/review capacity tính riêng; tất cả sprint còn Proposed, cần chốt giờ/tuần và refinement.\n\n"
    + "## Release gates\n\n" + table(["Mốc", "Forecast", "Kết quả", "Gate"], model.milestones.map(item => [item.id + ": " + item.name, item.after, milestoneReady(item) ? "Ready for PO review" : "Not reached", item.criteria]))
    + "\n\n## Đầu vào còn cần chốt\n\n" + table(["ID", "Đầu vào", "Owner", "Trạng thái"], model.externalDependencies.map(item => [item.id, item.description, item.owner, item.status]))
    + "\n\n[Nguồn dữ liệu](work-items.json) · [Hướng dẫn](README.md) · [Task board](TASK_BOARD.md) · [Sprint plan](SPRINT_PLAN.md).\n";
  let wbs = generated + "# WBS — cấu trúc công việc\n\nWBS chia theo deliverable; sprint là cách xếp lịch, không thay phân rã phạm vi. PB là ID nội bộ.\n\n"
    + "## WBS-0 / Baseline đã có\n\n" + table(["Feature", "Mức kiểm chứng", "Nguồn"], model.baseline.map(item => [item.featureId, item.status, "[Spec](" + path.posix.relative(root, item.docs) + ") / [audit](" + path.posix.relative(root, item.audit) + ")"]));
  for (const epic of model.epics) {
    wbs += "\n\n## " + epic.id + " / " + epic.name + "\n\n" + epic.outcome + "\n\n";
    for (const item of model.features.filter(feature => feature.epic === epic.id)) {
      wbs += "- **" + item.wbs + " / " + item.id + " — " + item.title + "** (" + item.priority + ", " + item.scope + ", " + (item.sprint ?? "Unscheduled") + ").\n";
      for (const id of item.tasks) wbs += "  - " + id + " — " + byTask.get(id).title + "\n";
      if (!item.tasks.length) wbs += "  - Cần refine/split/estimate trước khi lên sprint; không giả task đã có.\n";
    }
  }
  outputs["WBS.md"] = wbs;
  outputs["PRODUCT_BACKLOG.md"] = generated + "# Product backlog\n\nP0: core self-study/release gates. P1: context expansion. P2: sau beta. Core/Stretch là scope của sprint, không thay business priority; task Done và evidence mới quyết định hoàn tất.\n\n"
    + table(["PB / WBS", "Feature đề xuất/owner", "Tên", "Priority", "Scope", "Sprint", "Dev SP*", "State derived", "Depends", "Acceptance"], model.features.map(item => [
      item.id + " / " + item.wbs, item.featureId, item.title, item.priority, item.scope, item.sprint ?? "Unscheduled", item.points ?? "TBD/content", status(item), item.dependsOn.join(", ") || "—", item.acceptance,
    ]))
    + "\n\n*Estimate dev sơ bộ; content/review không được coi là0 effort. Các feature ID mới chưa có source/docs phải tạo5 docs chuẩn trước code. Existing feature dùng đúng canonical docs, không tạo bản spec trùng.\n\n[Tasks CSV](tasks.csv) · [Backlog CSV](product-backlog.csv) · [Baseline](../project-status.md).\n";
  outputs["SPRINT_PLAN.md"] = generated + "# Sprint plan — solo, proposed\n\n"
    + model.assumptions.map(item => "- " + item).join("\n")
    + "\n\n" + table(["Sprint", "State", "Start", "End", "Core dev SP*", "Stretch dev SP*", "Done dev SP*", "Task progress"], sprintRows);
  for (const sprint of model.sprints) {
    const items = model.features.filter(item => item.sprint === sprint.id);
    outputs["SPRINT_PLAN.md"] += "\n\n## " + sprint.id + " / " + sprint.name + "\n\n"
      + "**Sprint goal:** " + sprint.goal + "\n\n"
      + "- Core: " + items.filter(item => item.scope === "Core").map(item => item.id + " " + item.title).join("; ") + ".\n"
      + "- Stretch: " + (items.filter(item => item.scope === "Stretch").map(item => item.id + " " + item.title).join("; ") || "Không đề xuất kéo thêm; ưu tiên hoàn thiện review/QA") + ".\n"
      + "- Carry-in: chỉ kéo khi dependencies Done; nếu chưa, ưu tiên hoàn tất upstream và replan, không làm bypass gate.\n"
      + "- Capacity: giờ/tuần TBD; 25% dự phòng bugs/QA/handoff. Content review và code do cùng một người, không được tính như hai nguồn lực song song.\n"
      + "- Exit: Core acceptance đạt, tests/audit/docs/HANDOFF có evidence; Stretch chưa xong trả backlog và ghi rõ feature nào chưa bật.\n";
  }
  outputs["SPRINT_PLAN.md"] += "\n\nS1-S2 cần refinement/capacity trước khi Active; S3-S6 forecast, không phải cam kết12 tuần. Sprint không tự bắt đầu bằng việc sinh kế hoạch. Release cần PO go/no-go.\n";
  outputs["TASK_BOARD.md"] = generated + "# Task board\n\n"
    + table(["Task", "PB / Sprint", "Task", "Owner / role", "Status", "Readiness", "Depends", "Verification / evidence"], model.tasks.map(task => [
      task.id, task.parent + " / " + byFeature.get(task.parent).sprint, task.title, task.owner + " / " + task.role,
      task.status, ready(task), task.dependsOn.join(", ") || "—", task.verification + ": " + (task.evidence.join(", ") || "chưa có"),
    ]));
  outputs["tasks.csv"] = csv([
    ["Task ID", "PBI", "WBS", "Sprint", "Priority", "Scope", "Task", "Owner", "Role", "Status", "Readiness", "Depends on", "Verification", "Evidence", "Blocker", "Updated"],
    ...model.tasks.map(task => { const item = byFeature.get(task.parent); return [task.id, task.parent, item.wbs, item.sprint, item.priority, item.scope, task.title, task.owner, task.role, task.status, ready(task), task.dependsOn.join("; "), task.verification, task.evidence.join("; "), task.blocker, task.updated]; }),
  ]);
  outputs["product-backlog.csv"] = csv([
    ["PBI", "WBS", "Feature ID", "Title", "Priority", "Scope", "Sprint", "Dev SP draft", "Derived state", "Refinement", "Dependencies", "External", "Acceptance", "Content capacity"],
    ...model.features.map(item => [item.id, item.wbs, item.featureId, item.title, item.priority, item.scope, item.sprint, item.points, status(item), item.refinement, item.dependsOn.join("; "), item.external.join("; "), item.acceptance, item.contentCapacity]),
  ]);
  return outputs;
}

function run() {
  const model = JSON.parse(fs.readFileSync(root + "/work-items.json", "utf8"));
  validatePlanning(model);
  const outputs = buildViews(model);
  const write = process.argv.includes("--write");
  for (const [name, body] of Object.entries(outputs)) {
    const file = path.join(root, name);
    const output = name.endsWith(".md") ? body.trimEnd() + "\n" : body;
    if (write) fs.writeFileSync(file, output);
    else if (!fs.existsSync(file) || fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n") !== output.replaceAll("\r\n", "\n")) throw new Error("Generated planning view stale: " + file + "; run npm run plan:sync");
  }
  console.info("Planning " + (write ? "synced" : "checked") + ": " + model.baseline.length + " baseline domains, " + model.features.length + " PBIs, " + model.tasks.length + " tasks, " + model.sprints.length + " proposed sprints.");
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
