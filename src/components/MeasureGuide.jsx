import { C } from "../palette.js";
import { Disclosure } from "./Disclosure.jsx";
import { MeasureBust } from "./MeasureBust.jsx";

/* "How do I measure myself?" — the illustrated guide, folded under the You
   card. Everything in it comes from the dictionary. */
export function MeasureGuide({ t }) {
  return (
    <Disclosure summary={t("measure.summary")}>
      <div className="px-4 pb-4 flex flex-col sm:flex-row gap-4 items-start">
        <div className="shrink-0 mx-auto sm:mx-0">
          <MeasureBust label={t("measure.alt")} />
        </div>
        <div className="text-sm" style={{ color: C.espresso }}>
          <p className="mb-2">{t("measure.intro")}</p>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5">
            {t("measure.steps").map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <p className="mt-3" style={{ color: C.sageDark }}>{t("measure.tip")}</p>
        </div>
      </div>
    </Disclosure>
  );
}
