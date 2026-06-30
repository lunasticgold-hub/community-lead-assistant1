import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";
import { defaultKeywordGroups } from "@/lib/defaults";

export default function KeywordsPage() {
  return <AppShell title="Keywords & Signals"><div className="grid gap-4">{defaultKeywordGroups.map(group => <Card key={group.id}><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{group.name}</h2><Button variant="secondary">Edit group</Button></div><div className="mt-4 flex flex-wrap gap-2">{group.positiveKeywords.slice(0, 18).map(keyword => <Badge key={keyword}>{keyword}</Badge>)}</div><div className="mt-4 flex flex-wrap gap-2">{group.negativeKeywords.slice(0, 8).map(keyword => <Badge key={keyword} tone="red">{keyword}</Badge>)}</div></Card>)}</div></AppShell>;
}
