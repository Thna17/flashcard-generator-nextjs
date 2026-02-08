import { redirect } from "next/navigation";

import { pressStart } from "@/components/font";
import { Shell } from "@/components/layout/shell";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/features/home/dashboard-header";
import { DeckPageHeader } from "@/components/features/deck/deck-page-header";
import { CurrentCardItem } from "@/components/features/deck/current-card-item";
import { StatsCard } from "@/components/features/common/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RetroDropdown } from "@/components/features/common/retro-dropdown";

export default async function CreateDeckPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const currentCards = [
    {
      id: 1,
      question: "What is JSX?",
      answer: "Syntax extension for JavaScript...",
    },
    {
      id: 2,
      question: "Explain 'Props'.",
      answer: "Inputs passed to components...",
    },
    {
      id: 3,
      question: "What is 'State'?",
      answer: "Internal data managed by...",
    },
  ];

  return (
    <Shell
      header={<DashboardHeader playerName="THNA" />}
      mainClassName="gap-10 items-center"
    >
      <DeckPageHeader title="Create New Deck" />

      <RetroDropdown title="DECK CONFIGURATION (METADATA)" defaultOpen={true}>
        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          <StatsCard
            label="TITLE"
            name="title"
            value=""
            editable
            placeholder="[ REACTJS_INTERVIEW ]"
          />
          <StatsCard
            label="Description"
            name="description"
            value=""
            editable
            fieldType="description"
            multiline
            placeholder="[ CORE CONCEPTS.... ]"
          />
          <StatsCard
            label="VISIBILITY"
            name="visibility"
            value=""
            editable
            fieldType="visibility"
            defaultValue="private"
            options={[
              { label: "PRIVATE", value: "private", icon: "lock" },
              { label: "PUBLIC", value: "public", icon: "eye" },
            ]}
          />
        </div>
        <div className="flex justify-end mt-6">
          <Button type="submit" variant="cta" size="cta">
            Save Deck
          </Button>
        </div>
      </RetroDropdown>

      <RetroDropdown title="CARD EDITOR (INSERT DATA)" defaultOpen={true}>
        <FieldGroup className="w-full p-8 bg-white shadow-[8px_8px_0px_#000] rounded-none border-4 border-black mt-6">
          <Field>
            <FieldLabel
              htmlFor="fieldgroup-name"
              className={`${pressStart.className}`}
            >
              Front
            </FieldLabel>
            <Input
              id="fieldgroup-name"
              placeholder="What is the virtual DOM?"
            />
          </Field>
          <Field>
            <FieldLabel
              htmlFor="fieldgroup-name"
              className={`${pressStart.className}`}
            >
              Back
            </FieldLabel>
            <Input
              id="fieldgroup-name"
              placeholder="A lightweight copy of the actual DOM."
            />
          </Field>
          <div>
            <Button variant="cta" size="cta" type="submit">
              INSERT CARD
            </Button>
          </div>
        </FieldGroup>
      </RetroDropdown>

      <RetroDropdown title="CURRENT CARDS (CART_DATA: 24)" defaultOpen={true}>
        <div className="flex flex-col gap-5 mt-6">
          {currentCards.map((card, idx) => (
            <CurrentCardItem
              key={card.id}
              index={idx + 1}
              question={card.question}
              answer={card.answer}
            />
          ))}
        </div>
      </RetroDropdown>
    </Shell>
  );
}
