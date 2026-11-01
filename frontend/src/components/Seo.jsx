import { SEO_PAGES, SITE_URL } from '../seoPages';

const NoIndex = () => <meta name="robots" content="noindex, nofollow" />;

export const PublicSeo = ({ path }) => {
    const { title, description, indexable } = SEO_PAGES[path];
    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            {indexable ? <link rel="canonical" href={`${SITE_URL}${path}`} /> : <NoIndex />}
        </>
    );
};

export const PrivateSeo = () => (
    <>
        <title>ExamGuard AI</title>
        <NoIndex />
    </>
);
