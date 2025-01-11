#include <iostream>

#include <xrit_unreal/generate_mock_data.h>
#include <xrit_unreal/communication_protocol.h>

using namespace xrit_unreal;

int main(int argc, char** argv)
{
    // generates a set of all available mock data

    std::cout << "MOCK UNREAL MESSAGE:\n";
    std::cout << createMockUnrealMessage(UnrealCommand::set_configuration, generateMockConfiguration()) << "\n\n";

    std::cout << "MOCK NODE MESSAGE:\n";
    std::cout << createNodeMessage(NodeCommand::set_configuration_result, generateMockSetConfigurationResultSuccess()) << "\n\n";

    std::cout << "MOCK NODE MESSAGE:\n";
    std::cout << createNodeMessage(NodeCommand::set_configuration_result, generateMockSetConfigurationResultParseError()) << "\n\n";

    std::cout << std::endl;
}