alter table leads
  add column if not exists creator_email text not null default '',
  add column if not exists lead_category text not null default 'Common Freelance Tasks',
  add column if not exists lead_subcategory text not null default 'General Freelance Work',
  add column if not exists category_confidence integer not null default 10;

update leads
set creator_email = users.email
from users
where leads.owner_id = users.id
  and coalesce(leads.creator_email, '') = '';

update leads
set lead_category = case
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%wordpress%', '%shopify%', '%webflow%', '%website%', '%landing page%', '%frontend%', '%backend%', '%full stack%', '%api%']) then 'Web Development'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%android%', '%ios%', '%flutter%', '%react native%', '%mobile app%', '%swift%', '%kotlin%']) then 'Mobile App Development'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%chatbot%', '%gpt%', '%claude%', '%ai agent%', '%rag%', '%machine learning%', '%llm%', '%prompt%']) then 'AI & Machine Learning'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%figma%', '%ui%', '%ux%', '%wireframe%', '%prototype%', '%dashboard design%']) then 'UI/UX Design'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%logo%', '%brand identity%', '%graphic designer%', '%banner%', '%brochure%', '%presentation design%']) then 'Graphic Design'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%video editing%', '%motion graphics%', '%youtube editing%', '%reels%', '%tiktok editing%', '%animation%']) then 'Video & Animation'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%seo%', '%google ads%', '%meta ads%', '%lead generation%', '%cold email%', '%demand gen%', '%marketing agency%', '%cro%']) then 'Digital Marketing'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%appointment setter%', '%sdr%', '%sales development%', '%cold calling%', '%linkedin outreach%', '%lead qualification%']) then 'Sales'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%virtual assistant%', '%administrative%', '%email management%', '%calendar%', '%data entry%', '%research%']) then 'Virtual Assistance'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%customer support%', '%live chat%', '%help desk%', '%ticket%', '%technical support%']) then 'Customer Support'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%bookkeeping%', '%payroll%', '%tax%', '%accounting%', '%invoice%']) then 'Finance & Accounting'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%legal%', '%contract%', '%nda%', '%privacy policy%', '%trademark%']) then 'Legal'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%excel%', '%google sheets%', '%power bi%', '%tableau%', '%sql%', '%data analysis%', '%dashboard%']) then 'Data'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%aws%', '%azure%', '%docker%', '%kubernetes%', '%devops%', '%github actions%', '%server administration%']) then 'Cloud & DevOps'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%qa%', '%testing%', '%selenium%', '%cypress%', '%playwright%', '%bug reporting%']) then 'QA & Testing'
    else lead_category
  end,
  lead_subcategory = case
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%lead generation%' then 'Lead Generation'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%appointment setter%' then 'Appointment Setting'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%cold email%' then 'Cold Email'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%wordpress%' then 'WordPress Development'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%shopify%' then 'Shopify Development'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%figma%' then 'Figma Design'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%seo%' then 'SEO'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%data entry%' then 'Data Entry'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%virtual assistant%' then 'Virtual Assistant'
    else lead_subcategory
  end,
  category_confidence = greatest(category_confidence, 40);

create index if not exists leads_creator_email_idx on leads(creator_email);
create index if not exists leads_category_idx on leads(lead_category, lead_subcategory);
create index if not exists leads_workspace_category_idx on leads(workspace_id, lead_category, lead_subcategory);
