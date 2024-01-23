interface DashboardHeaderProps {
    title: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
    return (
        <div className="d-flex justify-content-between align-items-center">
            <h2 className="font-weight-bold text-xl text-gray-800">{title}</h2>
            {/* Add your buttons to the right here */}
            <div className="d-flex">
                {/* Place for buttons or other elements */}
            </div>
        </div>
    );
};

export default DashboardHeader;
