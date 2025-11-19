import Button from "../components/Button";
import Card from "../components/Card";

export default function Home() {
    return (
        <div className="space-y-8">
            <section className="bg-base-100 rounded-lg p-8 shadow">
                <div className="text-left">
                    <div>
                        <h1 className="text-4xl font-bold">
                            Welcome to CampusConnect
                        </h1>
                        <p className="py-4 text-slate-600">
                            One place for complaints, cycle lending, lost &amp;
                            found and book bank.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button href="/complaints" variant="primary">
                                File a Complaint
                            </Button>
                            <Button href="/lend-cycle" variant="secondary">
                                Borrow a Cycle
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <h3 className="font-semibold">Hostel Complaint Box</h3>
                        <p className="text-sm text-slate-600">
                            Report issues and track progress.
                        </p>
                        <div className="mt-3">
                            <Button
                                href="/complaints"
                                variant="ghost"
                                className="btn-sm"
                            >
                                Go
                            </Button>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="font-semibold">Lend a Cycle</h3>
                        <p className="text-sm text-slate-600">
                            Quickly borrow a bicycle on campus.
                        </p>
                        <div className="mt-3">
                            <Button
                                href="/lend-cycle"
                                variant="ghost"
                                className="btn-sm"
                            >
                                Go
                            </Button>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="font-semibold">Lost &amp; Found</h3>
                        <p className="text-sm text-slate-600">
                            Report lost or found items and browse listings.
                        </p>
                        <div className="mt-3">
                            <Button
                                href="/lost-found"
                                variant="ghost"
                                className="btn-sm"
                            >
                                Go
                            </Button>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
}
