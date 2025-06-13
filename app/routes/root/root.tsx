import {Link} from "react-router";
import {ButtonComponent} from "@syncfusion/ej2-react-buttons";

const Index = () => {
    return (
        <main className="flex items-center justify-center w-full h-screen bg-background">
            <div className="max-w-2xl mx-auto text-center px-4">
                <div className="flex items-center justify-center space-x-3 mb-8">
                    <h1 className="text-6xl font-bold text-foreground">Tourvisto</h1>
                </div>
                <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                    Professional travel agency crafting extraordinary journeys
                </p>
                <Link to="/dashboard">
                    <ButtonComponent cssClass="e-info" className="px-12 py-6 text-lg font-medium">
                        Access Dashboard
                    </ButtonComponent>
                </Link>
            </div>
        </main>
    );
};

export default Index;
