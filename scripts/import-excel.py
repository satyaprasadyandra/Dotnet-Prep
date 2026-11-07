"""One-time import: Excel workbook -> data/seed.json"""
import json
import openpyxl
from pathlib import Path

EXCEL_PATH = Path(r"c:\Users\HP\Downloads\Product_Company_DotNet_Interview_Tracker_v2.xlsx")
OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "seed.json"


def rows(ws, start_row=1):
    result = []
    for row in ws.iter_rows(min_row=start_row, max_row=ws.max_row, values_only=True):
        result.append([v if v is not None else None for v in row])
    return result


def parse_daily_tracker(ws):
    items = []
    for row in ws.iter_rows(min_row=4, max_row=ws.max_row, values_only=True):
        if row[0] is None:
            continue
        items.append({
            "day": row[0],
            "week": row[1],
            "dayName": row[2],
            "phase": row[3],
            "dsaTopic": row[4],
            "dsaPractice": row[5],
            "mainSubject": row[6],
            "mainTopic": row[7],
            "mainPractice": row[8],
            "secondSubject": row[9],
            "secondTopic": row[10],
            "secondPractice": row[11],
            "checklist": row[12] or "☐ Learn  ☐ Practice  ☐ Revise",
            "status": row[13] or "Not Started",
            "notes": row[14] or "",
            "learnDone": False,
            "practiceDone": False,
            "reviseDone": False,
        })
    return items


def parse_topic_master(ws):
    items = []
    for row in ws.iter_rows(min_row=4, max_row=ws.max_row, values_only=True):
        if row[0] is None:
            continue
        items.append({
            "id": row[0],
            "subject": row[1],
            "topic": row[2],
            "plannedDay": row[3],
            "week": row[4],
            "phase": row[5],
            "course": row[6],
            "practiceRequirement": row[7],
            "status": row[8] or "Not Started",
            "completedDay": row[9],
            "practiceCompleted": False,
            "interviewQA": [],
        })
    return items


def parse_weekly_plan(ws):
    weeks = []
    for row in ws.iter_rows(min_row=4, max_row=ws.max_row, values_only=True):
        if row[0] is None:
            continue
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        week = {"week": row[0], "days": {}}
        for i, day in enumerate(days):
            cell = row[i + 1] or ""
            week["days"][day] = {"text": cell, "completed": False}
        weeks.append(week)
    return weeks


def parse_physical_tracker(ws):
    weeks = []
    for row in ws.iter_rows(min_row=4, max_row=ws.max_row, values_only=True):
        if row[0] is None:
            continue
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        week = {
            "week": row[0],
            "weeklyFocus": row[8] or "",
            "days": {d: {"completed": False} for d in days},
        }
        for i, day in enumerate(days):
            val = row[i + 1]
            if val is True or val == "✓" or val == "☑":
                week["days"][day]["completed"] = True
        weeks.append(week)
    return weeks


def parse_subject_progress(ws):
    items = []
    for row in ws.iter_rows(min_row=4, max_row=ws.max_row, values_only=True):
        if row[0] is None:
            continue
        items.append({
            "subject": row[0],
            "totalTopics": row[1],
            "completed": row[2] or 0,
            "inProgress": row[3] or 0,
            "pending": row[4] or 0,
            "percentComplete": row[5] or 0,
            "firstPlannedDay": row[6],
            "lastPlannedDay": row[7],
        })
    return items


def parse_course_map(ws):
    items = []
    for row in ws.iter_rows(min_row=4, max_row=ws.max_row, values_only=True):
        if row[0] is None:
            continue
        items.append({
            "course": row[0],
            "currentProgress": row[1] or "0%",
            "useFor": row[2],
            "howToUse": row[3],
        })
    return items


def parse_milestones(ws):
    items = []
    for row in ws.iter_rows(min_row=4, max_row=ws.max_row, values_only=True):
        if row[0] is None:
            continue
        items.append({
            "milestone": row[0],
            "targetDay": row[1],
            "requiredCapability": row[2],
            "practice": row[3],
            "status": row[4] or "Not Started",
            "notes": row[5] or "",
        })
    return items


def parse_start_here(ws):
    info = {}
    for row in ws.iter_rows(min_row=3, max_row=17, values_only=True):
        if row[0] and row[1]:
            info[str(row[0])] = row[1]
    return info


def main():
    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
    seed = {
        "meta": {
            "title": "Product Company .NET Interview — 182 Day Master Plan",
            "source": str(EXCEL_PATH),
        },
        "startHere": parse_start_here(wb["START HERE"]),
        "physicalTracker": parse_physical_tracker(wb["Physical Tracker"]),
        "weeklyPlan": parse_weekly_plan(wb["Weekly Plan"]),
        "dailyTracker": parse_daily_tracker(wb["Daily Topic Tracker"]),
        "topicMaster": parse_topic_master(wb["Topic Master"]),
        "subjectProgress": parse_subject_progress(wb["Subject Progress"]),
        "courseMap": parse_course_map(wb["Course Map"]),
        "milestones": parse_milestones(wb["Interview Milestones"]),
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(seed, f, ensure_ascii=False, indent=2)
    print(f"Wrote {OUT_PATH}")
    print(f"  daily: {len(seed['dailyTracker'])} days")
    print(f"  topics: {len(seed['topicMaster'])} topics")


if __name__ == "__main__":
    main()
