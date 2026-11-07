"""Generate topic-guides.json — explanations, examples, and flow for all 284 topics."""
import json
import re
from pathlib import Path

SEED_PATH = Path(__file__).resolve().parent.parent / "data" / "seed.json"
OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "topic-guides.json"


def flow(*steps):
    return [{"step": i + 1, "title": s[0], "description": s[1]} for i, s in enumerate(steps)]


SUBJECT_CONTEXT = {
    "C#": {
        "domain": ".NET backend and application code",
        "runtime": "CLR / JIT compilation",
        "product": "Order API, payment service, or background worker in a product company",
    },
    "SQL": {
        "domain": "relational database queries and data modeling",
        "runtime": "SQL Server query execution engine",
        "product": "Reporting dashboard, billing queries, or user analytics at scale",
    },
    "LINQ": {
        "domain": "in-memory and EF-translated data queries in C#",
        "runtime": "IEnumerable pipeline or IQueryable expression tree",
        "product": "Filtering orders, projecting DTOs, or aggregating metrics in a Web API",
    },
    "EF Core": {
        "domain": "ORM mapping between C# entities and SQL tables",
        "runtime": "DbContext change tracker and SQL generator",
        "product": "User/Order repository layer behind an ASP.NET Core API",
    },
    "ASP.NET Core / Web API": {
        "domain": "HTTP APIs, middleware, auth, and hosting",
        "runtime": "Kestrel request pipeline",
        "product": "Public REST API consumed by web/mobile clients",
    },
    "Azure": {
        "domain": "cloud hosting, storage, messaging, and identity on Azure",
        "runtime": "Azure PaaS/IaaS managed services",
        "product": "SaaS app deployed to App Service with Blob storage and Service Bus",
    },
    "Microservices / DevOps / AKS": {
        "domain": "distributed systems, CI/CD, containers, and Kubernetes",
        "runtime": "Docker containers orchestrated on AKS with Azure DevOps pipelines",
        "product": "E-commerce platform split into Order, Payment, and Notification services",
    },
    "React": {
        "domain": "frontend UI components and state for full-stack roles",
        "runtime": "Browser React reconciliation and virtual DOM",
        "product": "Admin dashboard or customer portal calling your .NET API",
    },
    "System Design / LLD / Testing": {
        "domain": "architecture patterns, low-level design, and test strategy",
        "runtime": "Design discussions and xUnit/Moq test suites",
        "product": "Designing a notification system or refactoring a monolith service",
    },
    "DSA": {
        "domain": "algorithms and data structures for coding rounds",
        "runtime": "LeetCode-style problem solving under time limits",
        "product": "Screening round at Amazon, Flipkart, or Microsoft for backend roles",
    },
}


def subject_intro(subject, topic):
    ctx = SUBJECT_CONTEXT.get(subject, SUBJECT_CONTEXT["C#"])
    return (
        f"**{topic}** is a core interview topic in {ctx['domain']}. "
        f"In product-company .NET interviews, expect questions that connect theory to "
        f"real production scenarios — not just definitions."
    )


def build_guide(topic_row):
    subject = topic_row["subject"]
    topic = topic_row["topic"]
    practice = topic_row.get("practiceRequirement") or "Practice with code and interview Q&A"
    day = topic_row.get("plannedDay", 0)
    tid = topic_row["id"]
    ctx = SUBJECT_CONTEXT.get(subject, SUBJECT_CONTEXT["C#"])

    explanation = (
        f"{subject_intro(subject, topic)}\n\n"
        f"**Why it matters:** Interviewers use {topic} to check whether you understand "
        f"how {ctx['runtime']} behaves under load, edge cases, and trade-offs — not only syntax.\n\n"
        f"**What to master:** {practice}. Tie every answer to a concrete scenario in "
        f"{ctx['product']}."
    )

    real_world = (
        f"**Scenario:** You are building {ctx['product']}. A bug report says "
        f"\"{topic}\" behaves differently in staging vs production.\n\n"
        f"**Your task:** Explain how {topic} works at runtime, identify the failure point, "
        f"and propose a fix an interviewer would accept in a 45-minute backend loop."
    )

    flow_steps = default_flow(subject, topic, ctx)
    key_points = default_key_points(subject, topic)
    pitfalls = default_pitfalls(subject, topic)

    return {
        "id": tid,
        "subject": subject,
        "topic": topic,
        "summary": f"{topic} — {subject} (Day {day})",
        "explanation": explanation,
        "realWorldExample": real_world,
        "flowSteps": flow_steps,
        "keyInterviewPoints": key_points,
        "commonPitfalls": pitfalls,
    }


def default_flow(subject, topic, ctx):
    base = [
        ("Trigger / Input", f"A real request or data change invokes {topic} in {ctx['product']}."),
        ("Runtime processing", f"{ctx['runtime']} applies {topic} rules — this is what interviewers ask you to trace."),
        ("Side effects", "Memory, I/O, network, or DB changes happen here. Know what is synchronous vs deferred."),
        ("Output / Response", "Result returned to caller, UI, or next pipeline stage."),
        ("Verify in interview", f"Explain trade-offs, complexity, and failure modes of {topic}."),
    ]
    if subject == "DSA":
        base = [
            ("Read problem", f"Identify pattern for {topic} — constraints, input size, edge cases."),
            ("Choose approach", "Brute force first, then optimize using the right data structure."),
            ("Implement", f"Code {topic} solution with clear variable names and bounds checks."),
            ("Analyze", "State time and space complexity — Big-O is mandatory."),
            ("Test & discuss", "Walk through 2–3 examples including empty input and large N."),
        ]
    elif subject == "SQL":
        base = [
            ("Business question", f"PM asks a metric that requires {topic} on production data."),
            ("Write query", f"Draft SQL using {topic}; estimate rows scanned and indexes used."),
            ("Execution plan", "SQL Server optimizer chooses join/order — explain why index matters."),
            ("Validate results", "Check NULLs, duplicates, and correct aggregation."),
            ("Production safety", "Discuss timeouts, locking, and read replicas for heavy queries."),
        ]
    elif subject == "EF Core":
        base = [
            ("API request", "Controller receives DTO and calls service/repository."),
            ("DbContext query", f"LINQ/EF builds SQL for {topic} — watch tracking and includes."),
            ("SQL execution", "Database returns entities; change tracker records state."),
            ("SaveChanges", "Unit of work commits transaction or rolls back on failure."),
            ("Interview deep-dive", "N+1, tracking modes, compiled queries, and migrations."),
        ]
    elif subject == "ASP.NET Core / Web API":
        base = [
            ("HTTP request", "Client hits endpoint — Kestrel receives bytes."),
            ("Middleware pipeline", f"Each middleware runs in order until {topic} logic executes."),
            ("Controller / endpoint", "Model binding, validation, and business service call."),
            ("Response", "Status code, headers, JSON serialization, and logging."),
            ("Cross-cutting", "Auth, DI scope, exception middleware, and observability."),
        ]
    elif subject == "Azure":
        base = [
            ("Architecture decision", f"Team chooses Azure service for {topic} requirement."),
            ("Provision & configure", "IaC/portal setup, connection strings, managed identity."),
            ("Runtime traffic", "Live requests/messages flow through the Azure component."),
            ("Monitor & scale", "App Insights, alerts, auto-scale rules, and cost controls."),
            ("Interview angle", "Compare alternatives, SLA, security, and disaster recovery."),
        ]
    elif subject == "React":
        base = [
            ("User action", f"Click/input triggers event related to {topic}."),
            ("State update", "React schedules re-render based on props/state/hooks rules."),
            ("Reconciliation", "Virtual DOM diff decides minimal DOM updates."),
            ("Side effects", "useEffect, API calls, and .NET backend fetch."),
            ("Interview focus", "Performance, keys, controlled forms, and state placement."),
        ]
    return flow(*base)


def default_key_points(subject, topic):
    return [
        f"Define {topic} in one clear sentence before going deep.",
        f"Give a production example from {SUBJECT_CONTEXT.get(subject, {})['product'] if subject in SUBJECT_CONTEXT else 'a .NET product'}.",
        "Mention trade-offs — there is almost always a 'it depends' in product interviews.",
        f"Connect to your planned practice: study the topic then do hands-on coding.",
    ]


def default_pitfalls(subject, topic):
    common = [
        "Answering with textbook definitions only — no real example.",
        "Ignoring edge cases (null, empty, concurrency, scale).",
        "Not stating time/space complexity or performance impact when relevant.",
    ]
    if subject == "EF Core":
        common.append("Forgetting N+1 queries and accidental tracking overhead.")
    if subject == "ASP.NET Core / Web API":
        common.append("Wrong middleware order or misunderstanding DI lifetimes.")
    if subject == "Azure":
        common.append("Naming services without justifying cost, security, or ops burden.")
    return common


def enrich_specific(guide, topic_row):
    """Add topic-specific overrides for high-value interview topics."""
    topic = topic_row["topic"].lower()
    subject = topic_row["subject"]

    overrides = {
        "value types vs reference types": {
            "realWorldExample": (
                "**Scenario:** OrderService caches `decimal total` (value type) but passes `OrderDto` (reference type) "
                "to multiple threads.\n\n"
                "**Runtime flow:** Value types copy on stack; reference types share heap identity. "
                "Interviewers ask what happens when two methods mutate the same Order object vs two separate ints."
            ),
            "flowSteps": flow(
                ("Declare variable", "int/count on stack; class instance holds reference on stack pointing to heap."),
                ("Assignment", "Value type copies data; reference type copies pointer — aliasing possible."),
                ("Method call", "Pass by value always; ref/out keywords change semantics for references."),
                ("GC impact", "Only reference types on heap are GC-tracked; structs avoid heap unless boxed."),
                ("Interview answer", "Explain stack vs heap, copying cost, and when to use struct vs class."),
            ),
        },
        "boxing and unboxing": {
            "realWorldExample": (
                "**Scenario:** Hot path logs metrics using `ArrayList` with ints — causes hidden allocations.\n\n"
                "Each int boxes to object on heap → GC pressure. Fix: use `List<int>` or generics."
            ),
        },
        "n+1 problem": {
            "realWorldExample": (
                "**Scenario:** GET /orders returns 100 orders; EF lazy-loads each Customer in a loop → 101 SQL round trips.\n\n"
                "**Fix:** `.Include(o => o.Customer)` or projection with single JOIN query."
            ),
        },
        "middleware ordering": {
            "realWorldExample": (
                "**Scenario:** Exception middleware placed AFTER routing — unhandled errors return blank 500.\n\n"
                "**Correct order:** Exception → HTTPS → Auth → Routing → Endpoints."
            ),
        },
        "big-o time complexity": {
            "realWorldExample": (
                "**Scenario:** Interview: 'Find duplicate in 10M user IDs.' O(n²) nested loop fails; O(n) HashSet passes.\n\n"
                "Always map input size to acceptable complexity before coding."
            ),
        },
        "two sum / hashing": {
            "realWorldExample": (
                "**Classic FAANG pattern:** Given array and target, return indices using Dictionary complement lookup — O(n) time."
            ),
        },
    }

    for key, patch in overrides.items():
        if key in topic.lower():
            guide.update(patch)
            break

    return guide


def main():
    with open(SEED_PATH, encoding="utf-8") as f:
        seed = json.load(f)

    guides = {}
    for row in seed["topicMaster"]:
        g = build_guide(row)
        g = enrich_specific(g, row)
        guides[str(row["id"])] = g

    out = {
        "meta": {
            "total": len(guides),
            "description": "Interview guides with explanations, examples, and flow diagrams per topic",
        },
        "guides": guides,
    }
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(guides)} topic guides to {OUT_PATH}")


if __name__ == "__main__":
    main()
