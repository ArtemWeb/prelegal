"use client";

import { NDAData } from "@/types/nda";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const STANDARD_TERMS = `1. **Introduction**. This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) ("**MNDA**") allows each party ("**Disclosing Party**") to disclose or make available information in connection with the Purpose which (1) the Disclosing Party identifies to the receiving party ("**Receiving Party**") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("**Confidential Information**"). Each party's Confidential Information also includes the existence and status of the parties' discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how.

2. **Use and Protection of Confidential Information**. The Receiving Party shall: (a) use Confidential Information solely for the Purpose; (b) not disclose Confidential Information to third parties without the Disclosing Party's prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the Purpose, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.

3. **Exceptions**. The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.

4. **Disclosures Required by Law**. The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party's expense, with the Disclosing Party's efforts to obtain confidential treatment for the Confidential Information.

5. **Term and Termination**. This MNDA commences on the Effective Date and expires at the end of the MNDA Term. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party's obligations relating to Confidential Information will survive for the Term of Confidentiality, despite any expiration or termination of this MNDA.

6. **Return or Destruction of Confidential Information**. Upon expiration or termination of this MNDA or upon the Disclosing Party's earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party's written request, destroy all Confidential Information in the Receiving Party's possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.

7. **Proprietary Rights**. The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.

8. **Disclaimer**. ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

9. **Governing Law and Jurisdiction**. This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of {governingLaw}, without regard to the conflict of laws provisions of such {governingLaw}. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in {jurisdiction}. Each party irrevocably submits to the exclusive jurisdiction of such {jurisdiction} in any such suit, action, or proceeding.

10. **Equitable Relief**. A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.

11. **General**. Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party's permitted successors and assigns. Waivers must be signed by the waiving party's authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.`;

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mt-4 mb-0.5">{children}</p>;
}

function Value({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-800">{children}</p>;
}

function SignatureField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900 min-h-[1.25rem]">{value}</p>
      <div className="border-b border-gray-300 mt-1" />
    </div>
  );
}

export default function NDAPreview({ data }: { data: NDAData }) {
  const mndaTerm =
    data.mndaTermType === "years"
      ? `Expires ${data.mndaTermYears} year(s) from Effective Date.`
      : "Continues until terminated in accordance with the terms of the MNDA.";

  const confidentialityTerm =
    data.confidentialityType === "years"
      ? `${data.confidentialityYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
      : "In perpetuity.";

  const standardTermsText = STANDARD_TERMS
    .replace(/\{governingLaw\}/g, data.governingLaw || "[Governing Law]")
    .replace(/\{jurisdiction\}/g, data.jurisdiction || "[Jurisdiction]");

  return (
    <div className="bg-white font-serif text-gray-900">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Mutual Non-Disclosure Agreement</h1>
        <p className="text-xs text-gray-500 mt-1">Common Paper Mutual NDA Standard Terms Version 1.0</p>
      </div>

      {/* Cover Page */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-bold mb-4">Cover Page</h2>

        <Label>Purpose</Label>
        <Value>{data.purpose || "[Not specified]"}</Value>

        <Label>Effective Date</Label>
        <Value>{data.effectiveDate || "[Not specified]"}</Value>

        <Label>MNDA Term</Label>
        <Value>{mndaTerm}</Value>

        <Label>Term of Confidentiality</Label>
        <Value>{confidentialityTerm}</Value>

        <Label>Governing Law &amp; Jurisdiction</Label>
        <Value>Governing Law: {data.governingLaw || "[Not specified]"}</Value>
        <Value>Jurisdiction: {data.jurisdiction || "[Not specified]"}</Value>

        {data.modifications && (
          <>
            <Label>Modifications</Label>
            <Value>{data.modifications}</Value>
          </>
        )}
      </div>

      {/* Signing statement */}
      <p className="text-sm italic text-gray-600 mb-6">
        By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
      </p>

      {/* Party cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: "PARTY 1", company: data.party1Company, name: data.party1Name, title: data.party1Title, address: data.party1Address },
          { label: "PARTY 2", company: data.party2Company, name: data.party2Name, title: data.party2Title, address: data.party2Address },
        ].map((party) => (
          <div key={party.label} className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">{party.label}</p>
            <SignatureField label="Company" value={party.company} />
            <SignatureField label="Signature" value="" />
            <SignatureField label="Print Name" value={party.name} />
            <SignatureField label="Title" value={party.title} />
            <SignatureField label="Notice Address" value={party.address} />
          </div>
        ))}
      </div>

      {/* Standard Terms */}
      <div>
        <h2 className="text-base font-bold mb-4">Standard Terms</h2>
        <div className="text-sm leading-relaxed text-gray-800 space-y-3">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="text-justify">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              ol: ({ children }) => <ol className="list-decimal pl-5 space-y-3">{children}</ol>,
              li: ({ children }) => <li className="text-justify">{children}</li>,
            }}
          >
            {standardTermsText}
          </ReactMarkdown>
        </div>
        <p className="text-xs text-gray-400 mt-6 italic">
          Common Paper Mutual Non-Disclosure Agreement Version 1.0 — free to use under CC BY 4.0.
        </p>
      </div>
    </div>
  );
}
