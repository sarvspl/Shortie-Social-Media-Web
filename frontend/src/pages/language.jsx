import RootLayout from "@/component/layout/Layout";
import LanguageTable from "@/component/language/LanguageTable";
import LanguageDialogue from "@/component/language/LanguageDialogue";
import UploadCSVDialogue from "@/component/language/UploadCSVDialogue";
import TranslationInfoDialogue from "@/component/language/TranslationInfoDialogue";
import { useAppSelector } from "@/store/store";

const language = () => {
    const { dialogueType } = useAppSelector((state) => state.dialogue);

    return (
        <div className="userPage">
            <LanguageTable />
            {dialogueType === "language" && <LanguageDialogue />}
            {dialogueType === "uploadCSV" && <UploadCSVDialogue />}
            {dialogueType === "translationInfo" && <TranslationInfoDialogue />}
        </div>
    )
}

language.getLayout = function getLayout(page) {
    return <RootLayout>{page}</RootLayout>;
};

export default language;