import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { defaultKeywordGroups } from "@/lib/defaults";
import { buildKeywordSuggestions, keywordModifiers, keywordRoles } from "@/lib/marketing";

export default function KeywordsPage() {
  const featuredRoles = keywordRoles.slice(0, 24);

  return (
    <AppShell title="Keywords & Signals">
      <div className="grid gap-4">
        <Card>
          <Badge tone="blue">Keyword Intelligence V2</Badge>
          <h2 className="mt-3 text-xl font-semibold">Generate useful keyword combinations by role, service, and work type.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start with a role, then combine it with modifiers such as freelance, contract, remote, agency, consulting, project based, and full time.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {keywordModifiers.map(modifier => <Badge key={modifier} tone="slate">{modifier}</Badge>)}
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {featuredRoles.map(role => (
            <Card key={role}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{role}</h2>
                <Badge tone="blue">{buildKeywordSuggestions(role).length} suggestions</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {buildKeywordSuggestions(role).slice(0, 8).map(keyword => <Badge key={keyword}>{keyword}</Badge>)}
              </div>
            </Card>
          ))}
        </div>

        {defaultKeywordGroups.map(group => (
          <Card key={group.id}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{group.name}</h2>
              <Badge tone="green">Default preset</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {group.positiveKeywords.slice(0, 18).map(keyword => <Badge key={keyword}>{keyword}</Badge>)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {group.negativeKeywords.slice(0, 8).map(keyword => <Badge key={keyword} tone="red">{keyword}</Badge>)}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
