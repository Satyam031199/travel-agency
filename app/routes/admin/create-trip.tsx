import {Header} from "../../../components";
import React, {useState} from "react";
import {ComboBoxComponent} from "@syncfusion/ej2-react-dropdowns";
import type { Route } from './+types/create-trip';
import {world_map} from "~/constants/world_map";
import {selectItems, comboBoxItems} from "~/constants";
import {LayerDirective, LayersDirective, MapsComponent} from "@syncfusion/ej2-react-maps";
import {ButtonComponent} from "@syncfusion/ej2-react-buttons";
import {account} from "~/appwrite/client";
import {formatKey, cn} from "~/lib/utils";
import {useNavigate} from "react-router";

export const loader = async () => {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    return data.map((country: any) => ({
        name: country.name.common,
        coordinates: country.latlng,
        value: country.name.common,
        openStreetMap: country.maps?.openStreetMap,
        flag: country.flags.svg,
    }))
}

const CreateTrip = ({ loaderData }: Route.ComponentProps) => {
    const navigate = useNavigate();
    const countries = loaderData as Country[];
    const [formData, setFormData] = useState<TripFormData>({
        country: countries[0]?.name || '',
        travelStyle: '',
        interest: '',
        budget: '',
        duration: 0,
        groupType: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const countryData = countries.map((country) => ({
        text: country.name,
        value: country.value,
        flag: country.flag,
    }));
    const mapData = [
        {
            country: formData.country,
            color: '#EA382E',
            coordinates: countries.find((c: Country) => c.name === formData.country)?.coordinates || []
        }
    ]
    const template = (data: any) => (
        <div className="flex items-center pl-2">
            <img src={data.flag} alt={`${data.text} flag`} className="w-5 h-4 object-cover rounded-sm" />
            <span>{data.text}</span>
        </div>
    );
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true);
        if(
            !formData.country ||
            !formData.travelStyle ||
            !formData.interest ||
            !formData.budget ||
            !formData.groupType
        ) {
            setError('Please provide values for all fields');
            setLoading(false)
            return;
        }
        if(formData.duration < 1 || formData.duration > 10) {
            setError('Duration must be between 1 and 10 days');
            setLoading(false)
            return;
        }
        const user = await account.get();
        if(!user.$id) {
            console.error('User not authenticated');
            setLoading(false)
            return;
        }
        try {
            const response = await fetch('/api/create-trip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    country: formData.country,
                    numberOfDays: formData.duration,
                    travelStyle: formData.travelStyle,
                    interests: formData.interest,
                    budget: formData.budget,
                    groupType: formData.groupType,
                    userId: user.$id
                })
            });
            const result: CreateTripResponse = await response.json();
            if(result?.id) navigate(`/trips/${result.id}`);
            else console.error('Failed to generate the trip');
        } catch (e) {
            console.error('Error generating trip', e);
        } finally {
            setLoading(false)
        }
    };
    const handleChange = (key: keyof TripFormData, value: string | number)  => {
        setFormData({ ...formData, [key]: value})
    }
    return (
        <main className='flex flex-col gap-10 pb-20 wrapper'>
            <Header title='Add a new Trip' description='View and edit AI-generated travel plans' />
            <section className='mt-2.5 wrapper-md'>
                <form className='trip-form' onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='country'>Country</label>
                        <ComboBoxComponent id='country' dataSource={countryData} fields={{ text: 'text', value: 'value' }} placeholder='Select a country' className='combo-box' itemTemplate={template} valueTemplate={template} change={(e: {value: string | undefined}) => {
                            if(e.value) {
                                handleChange('country',e.value);
                            }
                        }} allowFiltering={true} filtering={(e) => {
                            const query = e.text.toLowerCase();
                            e.updateData(
                                countries.filter((country) => country.name.toLowerCase().includes(query)).map(((country) => ({
                                    text: country.name,
                                    value: country.value,
                                    flag: country.flag,
                                })))
                            )
                        }}/>
                    </div>
                    <div>
                        <label htmlFor='duration'>Duration</label>
                        <input id='duration' name='duration' placeholder='Enter number of days' className='form-input placeholder:text-gray-100' onChange={(e) => handleChange('duration', Number(e.target.value))}/>
                    </div>
                    {selectItems.map((key) => {
                        return (
                            <div key={key}>
                                <label htmlFor={key}>{formatKey(key)}</label>
                                <ComboBoxComponent
                                    id={key}
                                    dataSource={comboBoxItems[key].map((item) => ({
                                        text: item,
                                        value: item,
                                    }))}
                                    fields={{ text: 'text', value: 'value'}}
                                    placeholder={`Select ${formatKey(key)}`}
                                    change={(e: { value: string | undefined }) => {
                                        if(e.value) {
                                            handleChange(key, e.value)
                                        }
                                    }}
                                    allowFiltering
                                    filtering={(e) => {
                                        const query = e.text.toLowerCase();

                                        e.updateData(
                                            comboBoxItems[key]
                                                .filter((item) => item.toLowerCase().includes(query))
                                                .map(((item) => ({
                                                    text: item,
                                                    value: item,
                                                }))))}}
                                    className="combo-box"
                                />
                            </div>
                        )
                    })}
                    <div>
                        <label htmlFor='location'>Location on the world map</label>
                        <MapsComponent>
                            <LayersDirective>
                                <LayerDirective
                                    shapeData={world_map}
                                    dataSource={mapData}
                                    shapePropertyPath="name"
                                    shapeDataPath="country"
                                    shapeSettings={{ colorValuePath: "color", fill: "#E5E5E5" }}
                                />
                            </LayersDirective>
                        </MapsComponent>
                    </div>
                    <div className='bg-gray-200 h-px w-full' />
                    {error && (
                        <div className='error'>
                            <p>{error}</p>
                        </div>
                    )}
                    <footer className='px-6 w-full'>
                        <ButtonComponent type='submit' className='button-class !h-12 !w-full' disabled={loading}>
                            <img src={`/assets/icons/${loading ? 'loader' : 'magic-star'}.svg`} className={cn('size-5', {
                                'animate-spin': loading
                            })} alt='search'/>
                            <span className='p-16-semibold text-white'>
                                {loading ? 'Generating Trip...' : 'Generate Trip'}
                            </span>
                        </ButtonComponent>
                    </footer>
                </form>
            </section>
        </main>
    )
}
export default CreateTrip
