#include <gtest/gtest.h>

#include <xrit_unreal/communication_protocol.h>

namespace xrit_unreal::service_tests
{
    TEST(Service, MessageData)
    {
        // message with data
        std::string message1 = "unreal_to_node:some_command_here\ndata_here";
        MessageData data1;
        bool success1 = getMessageData(message1, &data1);
        ASSERT_TRUE(success1);
        ASSERT_EQ(data1.channel, "unreal_to_node");
        ASSERT_EQ(data1.command, "some_command_here");
        ASSERT_EQ(data1.data, "data_here");

        // message without data
        std::string message2 = "unreal_to_node:other_command";
        MessageData data2;
        bool success2 = getMessageData(message2, &data2);
        ASSERT_TRUE(success2);
        ASSERT_EQ(data2.channel, "unreal_to_node");
        ASSERT_EQ(data2.command, "other_command");
        ASSERT_EQ(data2.data, std::string_view());

        // ill formed message
        std::string message3 = "ill_formed_message";
        MessageData data3;
        bool success3 = getMessageData(message3, &data3);
        ASSERT_FALSE(success3);

        // message without data, but with return
        std::string message4 = "unreal_to_node:no_data_with_return\n";
        MessageData data4;
        bool success4 = getMessageData(message4, &data4);
        ASSERT_TRUE(success4);
        ASSERT_EQ(data4.channel, "unreal_to_node");
        ASSERT_EQ(data4.command, "no_data_with_return");
        ASSERT_EQ(data4.data, std::string_view());
    }

    TEST(Service, Messages)
    {
        std::string message1 = "node_to_unreal:set_configuration\n{}";
        MessageData data1;
        ASSERT_TRUE(getMessageData(message1, &data1));
        UnrealMessageData unrealData1;
        ASSERT_TRUE(getUnrealMessage(data1, unrealData1));

        ASSERT_EQ(createNodeMessage(NodeCommand::initialized, "some data"), "unreal_to_node:initialized\nsome data");
        ASSERT_EQ(createNodeMessage(NodeCommand::initialized, ""), "unreal_to_node:initialized");
    }
}